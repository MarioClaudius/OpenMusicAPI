const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exception/InvariantError');
const NotFoundError = require('../exception/NotFoundError');

class AlbumLikesService {
  constructor(usersService, albumsService, cacheService) {
    this._pool = new Pool();
    this._usersService = usersService;
    this._albumsService = albumsService;
    this._cacheService = cacheService;
  }

  async addLike(userId, albumId) {
    const id = `album-like-${nanoid(16)}`;

    await this._usersService.getUserById(userId);
    await this._albumsService.getAlbumById(albumId);

    const query = {
      text: 'INSERT INTO user_album_likes VALUES ($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Like gagal ditambahkan');
    }

    await this._cacheService.delete(`albumLikes:${albumId}`);
  }

  async deleteLike(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Like gagal dihapus.');
    }

    await this._cacheService.delete(`albumLikes:${albumId}`);
  }

  async getAlbumLike(albumId) {
    try {
      const likeCount = await this._cacheService.get(`albumLikes:${albumId}`);
      return {
        cache: true,
        count: likeCount,
      };
    } catch (error) {
      const query = {
        text: 'SELECT COUNT(user_id) FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);
      const likeCount = result.rows[0].count;

      await this._cacheService.set(`albumLikes:${albumId}`, likeCount);
      return {
        cache: false,
        count: likeCount,
      };
    }
  }

  async checkAlbumLikeIsExist(userId, albumId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      return false;
    }

    return true;
  }
}

module.exports = AlbumLikesService;
