/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
/* eslint-disable camelcase */
const ClientError = require('../../exception/ClientError');
const SongsService = require('../../services/SongsService');
const UsersService = require('../../services/UsersService');

class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    this.postSongToPlaylistByIdHandler = this.postSongToPlaylistByIdHandler.bind(this);
    this.getSongsInPlaylistByIdHandler = this.getSongsInPlaylistByIdHandler.bind(this);
    this.deleteSongInPlaylistByIdHandler = this.deleteSongInPlaylistByIdHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    try {
      this._validator.validatePostPlaylistPayload(request.payload);
      const { name } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      const playlist_id = await this._service.addPlaylist({ name }, credentialId);

      const response = h.response({
        status: 'success',
        data: {
          playlistId: playlist_id,
        },
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
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlistsFromDatabase = await this._service.getPlaylists(credentialId); // service null
    const usersService = new UsersService();
    const playlistWithUsername = [];
    for (let i = 0; i < playlistsFromDatabase.rows.length; i++) {
      const user = await usersService.getUserById(playlistsFromDatabase.rows[i].owner);
      const data = {
        id: playlistsFromDatabase.rows[i].id,
        name: playlistsFromDatabase.rows[i].name,
        username: user.username,
      };
      playlistWithUsername.push(data);
    }
    return {
      status: 'success',
      data: {
        playlists: playlistWithUsername,
      },
    };
  }

  async deletePlaylistByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._service.verifyPlaylistOwner(id, credentialId);
      await this._service.deletePlaylistById(id);

      return {
        status: 'success',
        message: 'Playlist berhasil dihapus',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async postSongToPlaylistByIdHandler(request, h) {
    try {
      this._validator.validatePostSongToPlaylistPayload(request.payload);
      const { id: playlistId } = request.params;
      const { songId } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      // cek owner playlist
      await this._service.verifyPlaylistOwner(playlistId, credentialId);
      // cek id song valid
      const songService = new SongsService();
      await songService.getSongById(songId);

      // post song
      const id = await this._service.postSongToPlaylist(playlistId, songId);

      const response = h.response({
        status: 'success',
        message: 'Lagu berhasil ditambahkan ke playlist',
        data: {
          id,
        },
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

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getSongsInPlaylistByIdHandler(request, h) {
    try {
      const { id: playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      const usersService = new UsersService();
      const songsService = new SongsService();
      const user = await usersService.getUserById(credentialId);
      await this._service.verifyPlaylistOwner(playlistId, credentialId);
      const playlist = await this._service.getPlaylistById(playlistId);

      const songAndPlaylistRelation = await this._service.getSongsInPlaylist(playlistId);
      const songsArray = [];
      for (let i = 0; i < songAndPlaylistRelation.rows.length; i++) {
        const songData = await songsService.getSongById(songAndPlaylistRelation.rows[i].song_id);
        const song = {
          id: songData.id,
          title: songData.title,
          performer: songData.performer,
        };
        songsArray.push(song);
      }

      return {
        status: 'success',
        data: {
          playlist: {
            id: playlistId,
            name: playlist.name,
            username: user.username,
            songs: songsArray,
          },
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async deleteSongInPlaylistByIdHandler(request, h) {
    try {
      this._validator.validatePostSongToPlaylistPayload(request.payload);
      const { id: playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;
      const { songId } = request.payload;

      await this._service.verifyPlaylistOwner(playlistId, credentialId);
      await this._service.deleteSongInPlaylist(playlistId, songId);

      return {
        status: 'success',
        message: 'Lagu berhasil dihapus dari playlist',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = PlaylistsHandler;
