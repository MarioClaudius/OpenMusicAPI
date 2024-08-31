/* eslint-disable camelcase */
const ClientError = require('../../exception/ClientError');
const PlaylistsService = require('../../services/PlaylistsService');

class ExportsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postExportSongInPlaylistHandler = this.postExportSongInPlaylistHandler.bind(this);
  }

  async postExportSongInPlaylistHandler(request, h) {
    try {
      this._validator.validateExportSongInPlaylistPayload(request.payload);
      const { playlistId: playlist_id } = request.params;
      const credentialId = request.auth.credentials.id;
      const playlistsService = new PlaylistsService();
      await playlistsService.getPlaylistById(playlist_id);
      await playlistsService.verifyPlaylistOwner(playlist_id, credentialId);
      const message = {
        playlistId: playlist_id,
        targetEmail: request.payload.targetEmail,
      };

      await this._service.sendMessage('export:songsInPlaylist', JSON.stringify(message));
      const response = h.response({
        status: 'success',
        message: 'Permintaan Anda sedang kami proses',
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
}

module.exports = ExportsHandler;
