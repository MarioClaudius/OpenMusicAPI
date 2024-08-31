const ClientError = require('../../exception/ClientError');

class AlbumLikesHandler {
  constructor(service) {
    this._service = service;

    this.postAlbumLikeHandler = this.postAlbumLikeHandler.bind(this);
    this.getAlbumLikeHandler = this.getAlbumLikeHandler.bind(this);
  }

  async postAlbumLikeHandler(request, h) {
    try {
      const { id: albumId } = request.params;
      const userId = request.auth.credentials.id;
      let messageText;

      if (!await this._service.checkAlbumLikeIsExist(userId, albumId)) {
        await this._service.addLike(userId, albumId);
        messageText = 'Album disukai';
      } else {
        await this._service.deleteLike(userId, albumId);
        messageText = 'Album batal disukai';
      }
      const response = h.response({
        status: 'success',
        message: messageText,
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }
      const response = h.response({
        status: 'fail',
        message: 'Maaf, terjadi kegagalan pada server',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getAlbumLikeHandler(request, h) {
    const { id: albumId } = request.params;
    const { cache, count: likeCount } = await this._service.getAlbumLike(albumId);
    const response = h.response({
      status: 'success',
      data: {
        likes: Number(likeCount),
      },
    });
    if (cache) response.header('X-Data-Source', 'cache');
    return response;
  }
}

module.exports = AlbumLikesHandler;
