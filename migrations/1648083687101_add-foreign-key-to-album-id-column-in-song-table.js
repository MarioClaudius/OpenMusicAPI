/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql("INSERT INTO users(id, username, password, fullname) VALUES ('old_notes', 'old_notes', 'old_notes', 'old notes')");

  pgm.sql("UPDATE songs SET album_id = 'old_notes' WHERE album_id = NULL");

  pgm.addConstraint('songs', 'fk_songs.album_id_albums.id', 'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('songs', 'fk_songs.album_id_albums.id');

  pgm.sql("UPDATE songs SET album_id = NULL WHERE album_id = 'old_notes'");

  pgm.sql("DELETE FROM users WHERE id = 'old_notes'");
};
