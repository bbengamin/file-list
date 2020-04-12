require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const fs = require('fs');
const path = require('path');

app.use(cors())
app.use(express.static(process.env.VIDEO_PATH));

console.log()
app.get('/files', function (req, res) {
  try {
    const videoPath = process.env.VIDEO_PATH;
    const files = fs.readdirSync(videoPath);

    const result = files
      .filter(file => path.extname(file) === ".mp4")
      .map(video => {
        const ext = path.extname(video);
        const basename = path.basename(video, ext);
        const subtitle = basename + '.vtt';

        fs.closeSync(fs.openSync(videoPath + '/' + subtitle, 'a'))

        return {
          video: video,
          subtitles: subtitle
        }
      });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.json(err);
  }
});

app.listen(3000, function () {
  console.log('App listening on port 3000!');
});
