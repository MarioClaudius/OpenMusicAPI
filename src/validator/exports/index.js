const ExportSongInPlaylistPayloadSchema = require('./schema');
const InvariantError = require('../../exception/InvariantError');

const ExportsValidator = {
  validateExportSongInPlaylistPayload: (payload) => {
    const validationResult = ExportSongInPlaylistPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = ExportsValidator;
