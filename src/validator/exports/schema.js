const Joi = require('joi');

const ExportSongInPlaylistPayloadSchema = Joi.object({
  targetEmail: Joi.string().email({ tlds: true }).required(),
});

module.exports = ExportSongInPlaylistPayloadSchema;
