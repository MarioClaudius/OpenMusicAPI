const routes = (handler) => [
  {
    method: 'POST',
    path: '/export/playlists/{playlistId}',
    handler: handler.postExportSongInPlaylistHandler,
    options: {
      auth: 'openmusicapps_jwt',
    },
  },
];

module.exports = routes;
