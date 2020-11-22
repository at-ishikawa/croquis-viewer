import React, {ChangeEvent, useEffect, useState} from 'react';
import './App.css';

let timer: NodeJS.Timeout | null = null;

type Image = {
    name: string;
    url: string;
};

function App() {
    let [images, setImages] = useState([] as Image[]);
    let [currentImageIndex, setCurrentImageIndex] = useState(0);
    let [currentTime, setCurrentTime] = useState(0);
    let [startTime, setStartTime] = useState(0);
    let [isTimerActive, setTimerActivated] = useState(false);
    let [currentInterval, setCurrentInterval] = useState(60);

    useEffect(() => {
        if (currentTime > currentInterval) {
            stopTimer();
            if (currentImageIndex + 1 >= images.length) {
                setCurrentImageIndex(0);
                return;
            }
            setCurrentImageIndex(currentImageIndex + 1);
            startTimer();
        }
    }, [currentTime, startTime, currentImageIndex]);

    function startTimer() {
        const startTime = Date.now();
        setStartTime(startTime);
        setTimerActivated(true);
        timer = setInterval(() => {
            const currentTime = (Date.now() - startTime) / 1000;
            setCurrentTime(currentTime);
        }, 100);
    }

    function stopTimer() {
        if (timer == null) {
            console.error("timer is null");
            return;
        }

        clearInterval(timer);
        setCurrentTime(currentInterval);
        setTimerActivated(false);
    }

    function restart() {
        if (timer != null) {
            stopTimer();
        }

        setCurrentImageIndex(0);
        startTimer();
    }

    function fileChanged(event: ChangeEvent<HTMLInputElement>) {
        const files = event.target.files;
        if (null == files) {
            return;
        }
        if (files.length === 0) {
            return;
        }

        let nextImageIndex = 0;
        setCurrentImageIndex(0);
        for (let i = 0; i < files.length; i++) {
            if (!files[i].type.startsWith("image/")) {
                continue;
            }

            const reader = new FileReader();
            let handler: (self: FileReader, event: ProgressEvent<FileReader>) => any;

            const imageIndex = nextImageIndex;

            // @ts-ignore
            handler = (event: ProgressEvent<FileReader>) => {
                if (event.target == null) {
                    return;
                }

                images[imageIndex] = {
                    name: files[i].name,
                    url: event.target.result as string,
                };
                setImages(images);
                return images[imageIndex];
            };
            // @ts-ignore
            reader.onload = handler;

            reader.readAsDataURL(files[i]);
            nextImageIndex++;
        }
    }

    const image = images.length > 0 ? <div>
            <div>{images[currentImageIndex].name}</div>
            <img style={{minHeight:"80vh", maxHeight: "80vh"}} key={currentImageIndex} alt={""} src={images[currentImageIndex].url} />
        </div>:
        null;

    const timerButton = isTimerActive ?
        <button type="button" onClick={stopTimer}>Stop</button>
        : <button type="button" onClick={startTimer}>Start</button>;

  return (
    <div className="App">
      <header className="App-header">
          <form>
                  <div>
                  {image}
                  <span>
                      <button type="button" onClick={() => setCurrentImageIndex((currentImageIndex-1+images.length) % images.length) }>Previous</button>
                      <button type="button" onClick={() => setCurrentImageIndex((currentImageIndex+1+images.length)%images.length)}>Next</button>
                  </span>
              </div>

              <div>
                  <span>
                      ({ currentImageIndex + 1} / {images.length})
                      Remaining: {Math.trunc(currentInterval - currentTime)}
                  </span>
              </div>

              <div>
                  <input type="file"
                     // https://github.com/facebook/react/issues/3468
                     // @ts-expect-error
                     directory=""
                     webkitdirectory=""
                     multiple
                     accept="image/*"
                     onChange={fileChanged}
              />
              </div>

              <div>
                  <label htmlFor="interval">Interval (seconds):</label>
                  <input type="number" min="5" step="5" defaultValue={currentInterval} list="defaultIntervals" onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      if (event.target == null) {
                          return;
                      }

                      setCurrentInterval(event.target.valueAsNumber);
                  }}/>
                  <datalist id="defaultIntervals">
                      <option value="30" />
                      <option value="60" />
                      <option value="90" />
                      <option value="120" />
                      <option value="180" />
                      <option value="300" />
                      <option value="300" />
                      <option value="600" />
                  </datalist>
              </div>
              <div>
                  {timerButton}
                  <button type="button" onClick={restart}>Restart</button>
              </div>
          </form>
      </header>
    </div>
  );
}

export default App;
