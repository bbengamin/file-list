require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

app.use(cors())
app.use(express.static(process.env.VIDEO_PATH));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

app.post('/subtitles', function(req, res) {
  const videoPath = process.env.VIDEO_PATH;

  try {
    const currentVideoPath = videoPath + '/' + req.body.path;

    fs.access(currentVideoPath, fs.F_OK, (err) => {
      if (err) {
        throw "File " + currentVideoPath + " not exists!";
      }

      let content = "WEBVTT";

      let endline = "\n";

      let subtitles = req.body.subtitles;

      if(subtitles) {
          subtitles.forEach((subtitle, i, subtitles) => {
              content += endline + endline;
              content += i + endline;
              content += subtitle.start + " --> " + subtitle.end + endline;
              content += subtitle.text + " " + i;
          });
      }

      let subtitlePath = videoPath + '/' + path.basename(currentVideoPath, path.extname(currentVideoPath));

      fs.writeFileSync(subtitlePath + '.vtt', content);

      res.json({"success": true});
    });
  } catch(err) {
    console.error(err);
    res.json(err);
  }
});

app.listen(3000, function () {
  console.log('App listening on port 3000!');
});
