/* eslint-disable max-len */
/* eslint-disable no-plusplus */
/* eslint-disable camelcase */

const ClientError = require('../../exception/ClientError');

/* eslint-disable object-curly-newline */
class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongsHandler = this.getSongsHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }

  async postSongHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);
      const { title, year, genre, performer, duration, albumId } = request.payload;
      const song_id = await this._service.addSong({
        title,
        year,
        genre,
        performer,
        duration,
        albumId,
      });

      const response = h.response({
        status: 'success',
        data: {
          songId: song_id,
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
        status: 'fail',
        message: 'Maaf, terjadi kegagalan pada server',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getSongsHandler(request) {
    const { title, performer } = request.query;
    const songsFound = await this._service.getSongs();
    let songsAfterQuery = [];
    if (title !== undefined && performer !== undefined) {
      for (let i = 0; i < songsFound.length; i++) {
        if (songsFound[i].title.toLowerCase().includes(title.toLowerCase()) && songsFound[i].performer.toLowerCase().includes(performer.toLowerCase())) {
          songsAfterQuery.push(songsFound[i]);
        }
      }
    } else if (title !== undefined) {
      for (let i = 0; i < songsFound.length; i++) {
        if (songsFound[i].title.toLowerCase().includes(title.toLowerCase())) {
          songsAfterQuery.push(songsFound[i]);
        }
      }
    } else if (performer !== undefined) {
      for (let i = 0; i < songsFound.length; i++) {
        if (songsFound[i].performer.toLowerCase().includes(performer.toLowerCase())) {
          songsAfterQuery.push(songsFound[i]);
        }
      }
    } else {
      songsAfterQuery = songsFound;
    }
    const songsFoundReturn = [];
    for (let i = 0; i < songsAfterQuery.length; i++) {
      const songReturn = {
        id: songsAfterQuery[i].id,
        title: songsAfterQuery[i].title,
        performer: songsAfterQuery[i].performer,
      };
      songsFoundReturn.push(songReturn);
    }
    return {
      status: 'success',
      data: {
        songs: songsFoundReturn,
      },
    };
  }

  async getSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const songFound = await this._service.getSongById(id);
      return {
        status: 'success',
        data: {
          song: songFound,
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

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async putSongByIdHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);
      const { id } = request.params;
      await this._service.editSongById(id, request.payload);
      return {
        status: 'success',
        message: 'Lagu berhasil diperbarui',
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

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async deleteSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
      await this._service.deleteSongById(id);

      return {
        status: 'success',
        message: 'Lagu berhasil dihapus.',
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

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = SongsHandler;
