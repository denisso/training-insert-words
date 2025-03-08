import countWords from "../utils/countwords";
import fs from "fs";
import path from "path";

const dir = path.join(__dirname, "texts");

describe("countWords", () => {
  it("init", (done) => {
    fs.readdir(dir, (err, files) => {
      if (err) {
        console.log(err);
        done(err);
        return;
      }
      files = files.filter((name) => !path.basename(name).includes("."));

      Promise.all(
        files.map((file) =>
          countWords(fs.readFileSync(path.join(dir, file), "utf8"))
        )
      )
        .then((results) => {
          for (let i = 0; i < results.length; i++) {
            const rightCount = fs.readFileSync(
              path.join(dir, files[i]) + ".ans",
              "utf8"
            );
            expect(results[i]).toBe(+rightCount);
          }
          done();
        })
        .catch(done);
    });
  });
});
