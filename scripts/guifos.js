// ========================================================================================
// VARIABLES
// ========================================================================================
const apiKey = "KjTWeg2xoOpPhRFQlktWTLcicxoc5dF7";
const videoConstraints = {
    audio: false,
    video: true,
};
const guifosContainer = document.querySelector(".guifos-container");
let boxContainer = document.querySelector(".window-boxes-container");
let windowBoxes = boxContainer.querySelectorAll(".window-box");
// instructions box buttons
let createBoxCancelBtn = windowBoxes[0].querySelectorAll(".window-button")[0];
let createBoxContinueBtn = windowBoxes[0].querySelectorAll(".window-button")[1];
// camera activation buttons
let checkBoxCaptureBtn = windowBoxes[1].querySelectorAll(".window-button")[1];
let checkBoxCaptureCamBtn = windowBoxes[1].querySelectorAll(".window-button")[0];
let recordBoxRecordBtn = windowBoxes[2].querySelector(".btn-record");
let previewBoxUploadBtn = windowBoxes[3].querySelector("#preview-btn-upload");
let previewBoxRepeatBtn = windowBoxes[3].querySelector("#preview-btn-repeat");
let myInterval;
let isGifUploaded = false;
const uploadProgressBar = document.querySelector("#progress-bar-up");
const barArray = uploadProgressBar.children;
let progressInterval;

//let previewVideoBox = windowBoxes[1].querySelector(".video-box");

// ========================================================================================
// FUNCTIONS
// ========================================================================================

function hideAllGifScreens() {
    windowBoxes = boxContainer.querySelectorAll(".window-box");
    windowBoxes.forEach((node, index) => {
        node.classList.add("nodisplay")
    });
};
function hideGifScreen(screen) {
    screen.classList.add("nodisplay");
};
function showGifScreen(screen) {
    screen.classList.remove("nodisplay");
};
function switchGifScreen(currentScreen, newScreen) {
    hideGifScreen(currentScreen);
    showGifScreen(newScreen);
};

function passStreamToVideo(videoElement, stream) {
    videoElement.autoplay = true;
    videoElement.srcObject = stream;
    videoElement.muted = true;
    console.log("media stream passed to video element");
};

function startTimer(textElement) {
    console.log("timer started");
    let mseconds = 0;
    let seconds = 0;
    let minutes = 0;
    let hours = 0;
    let secondsStr = '';
    let minutesStr = '';
    let hoursStr = '';
    myInterval = window.setInterval(() => {
        mseconds += 10;
        if (mseconds > 999) {
            mseconds = 0;
            seconds += 1;
        }
        if (seconds > 59) {
            minutes += 1;
            seconds = 0;
        }
        if (minutes > 59) {
            hours += 1;
            minutes = 0;
            seconds = 0;
        }
        secondsStr = seconds < 10 ? '0' + seconds.toString() : seconds.toString();
        minutesStr = minutes < 10 ? '0' + minutes.toString() : minutes.toString();
        hoursStr = hours < 10 ? '0' + hours.toString() : hours.toString();
        textElement.innerText = `${hoursStr}:${minutesStr}:${secondsStr}:${Math.floor(mseconds / 10)}`;
    }, 10);
};
function stopTimer(timerText, newTimerElement) {
    console.log("timer stopped");
    clearInterval(myInterval);
    newTimerElement.innerText = timerText;
};

function setProgressClass() {
    let counter = 0;
    progressInterval = window.setInterval(() => {
        if (counter < 20) {
            barArray[counter].classList.add("complete");
            counter++;
        }
    }, 150);
}

function createUploadUrl(apiKey) {
    const myUrl = `https://upload.giphy.com/v1/gifs?api_key=${apiKey}`;
    return myUrl;
};

function endVideoStream(videoElement) {
    let tracks = videoElement.srcObject.getTracks();
    tracks.forEach((track) => track.stop());
    console.log("media stream is stopped in video element");
    //recorder.destroy();
};

function killVideoStreams() {
    const videoElementNodes = document.querySelectorAll("video");
    videoElementNodes.forEach((element) => {
        //endVideoStream(element);
        if (element.srcObject !== null) {
            endVideoStream(element);
        }
    });
}

function uploadToGiphy(apiKey, form, gifRecorder, videoRecorder) {
    let myURL = createUploadUrl(apiKey);
    const controller = new AbortController();
    const signal = controller.signal;
    abortGifUpload(controller);

    fetch(myURL, { method: "POST", body: form, signal })
        .then(response => {
            console.log(response.status);
            return response.json();
        })
        .then(data => {
            //console.log(data);
            //alert("upload successful!");
            console.log("request uploaded succesfully");
            clearInterval(progressInterval);
            switchGifScreen(windowBoxes[4], windowBoxes[5]);
            printGifToDOM(data, gifRecorder, videoRecorder);
            killVideoStreams();
            destroyRecorder(gifRecorder);
            destroyRecorder(videoRecorder);
        })
        .catch(e => {
            if (e.name === "AbortError") {
                console.log("Guifo upload aborted successfully " + e.name);
            } else {
                console.log(e);
            }
        })
}

function saveRecording(blob, gifRecorder, videoRecorder) {
    //previewBoxUploadBtn.addEventListener('click', () => {
    switchGifScreen(windowBoxes[3], windowBoxes[4]);
    setProgressClass();
    let form = new FormData();
    form.append('file', blob, 'mygif.gif');
    uploadToGiphy(apiKey, form, gifRecorder, videoRecorder);
};

function restartRecording(stream, recorder, flag) {
    switchGifScreen(windowBoxes[3], windowBoxes[1]);
    recorder.clearRecordedData();
    recorder.destroy();
    let newGifRecorder = RecordRTC(stream, { type: "gif", disableLogs: true });
    let newVideoRecorder = RecordRTC(stream, { type: "video", disableLogs: true });
    console.log(newGifRecorder.getState());
    console.log(newVideoRecorder.getState());
    startVideoRecording(stream, newGifRecorder, newVideoRecorder, flag);
    stopVideoRecording(stream, newGifRecorder, newVideoRecorder);
}

function saveFileToClient(blob) {
    invokeSaveAsDialog(blob, "miGuifo.gif");
};

function destroyRecorder(recorder) {
    recorder.destroy();
    console.log("recorder destroyed");
}

function printGifToDOM(response, recorder) {
    const gifId = response.data.id;
    const myGif = getGifById(apiKey, gifId);
    const copyLinkButton = document.querySelector("#uploaded-btn-copy");
    const downloadGifButton = document.querySelector("#uploaded-btn-download");
    const readyProcessButton = document.querySelector("#uploaded-btn-ready");

    myGif
        .then(r => {
            const gifUrl = r.data[0].images.original.url;
            const windowBoxGifImg = windowBoxes[5].querySelector(".content-img").querySelector("img");
            windowBoxGifImg.src = gifUrl;
            copyLinkButton.dataTag = gifUrl;
            downloadGifButton.dataTag = gifUrl;
            windowBoxGifImg.dataTag = gifUrl;
            saveGifIdToLocalStorage(r.data[0].id);
            addGuifoToContainer(gifUrl);
            addLongClassToContainerGifs(guifosContainer);
            // event listener for copy url
            copyUrlToClipboard(copyLinkButton, gifUrl);
            // event listener for ending the program
            finishRecordingProcess(readyProcessButton, recorder);
            // event listener for ending the program on the close image
            closeImageFinishRecordingProcess(recorder);
        })
        .catch(e => console.log("Error fetching gif from Giphy: " + e))
};

function createIdURL(apiKey, id) {
    return `https://api.giphy.com/v1/gifs?api_key=${apiKey}&ids=${id}`
};

function saveGifIdToLocalStorage(id) {
    // gifList = {"ids":["id1", "id2"...]} 
    //debugger;
    if (localStorage.getItem("gifIdList") !== null) {
        const gifIdList = readLocalStorage("gifIdList");
        localStorage.removeItem("gifIdList");
        gifIdArray = gifIdList.ids;
        gifIdArray.push(id);
        localStorage.setItem("gifIdList", JSON.stringify({ ids: gifIdArray }));
    } else {
        const gifIdArray = [id];
        const gifObject = { ids: gifIdArray };
        localStorage.setItem("gifIdList", JSON.stringify(gifObject));
    }
};

function addGuifoToContainer(gifUrl) {
    const gifDiv = document.createElement("div");
    const gifImg = document.createElement("img");
    gifImg.src = gifUrl;
    gifImg.className = "guifo";
    gifImg.alt = "guifo";
    gifDiv.className = "gif-container";
    gifDiv.appendChild(gifImg);
    guifosContainer.appendChild(gifDiv);
}

function addLongClassToContainerGifs(container) {
    let children = container.childNodes;
    children.forEach((element, index) => {
        if (((index + 1) % 5) === 0) {
            element.classList.add("long")
        }
    });
}

function readLocalStorage(keyName) {
    if (localStorage.getItem(keyName) !== null) {
        return JSON.parse(localStorage.getItem(keyName));
    } else {
        return {};
    }
};


function initializeGuifos() {
    // read localstorage
    const gifIdList = readLocalStorage("gifIdList");
    const isGuifosEnabled = readLocalStorage("guifosApp").isEnabled;
    if (!isGuifosEnabled) {
        hideAllGifScreens();
    };
    setThemeOnLoad();
    const gifArray = gifIdList.ids;
    guifosContainer.innerHTML = "";
    // pass gifs to gif container
    if (gifArray) {
        gifArray.forEach((element) => {
            const gifObject = getGifById(apiKey, element);
            gifObject
                .then(r => {
                    const gifUrl = r.data[0].images.original.url;
                    addGuifoToContainer(gifUrl);
                    addLongClassToContainerGifs(guifosContainer);
                })
                .catch(e => console.log(e))
        })
    }
};

// ========================================================================================
// ASYNC FUNCTIONS
// ========================================================================================

async function createVideoStream(videoConstraints) {
    let myVideo = await navigator.mediaDevices.getUserMedia(videoConstraints);
    return myVideo
};

async function getGifById(apiKey, id) {
    const myUrl = createIdURL(apiKey, id);
    const request = await fetch(myUrl);
    const object = await request.json();
    return object;
};

// ========================================================================================
// FUNCTIONS WITH EVENTS EMBEDED
// ========================================================================================

function startVideoRecording(stream, gifRecorder, videoRecorder, flag) {
    // event for the record button
    checkBoxCaptureBtn.addEventListener('click', () => {
        passStreamToVideo(windowBoxes[2].querySelector(".video-box"), stream);
        if (flag === true) {
            switchGifScreen(windowBoxes[1], windowBoxes[2]);
        };
        // start timer
        startTimer(document.querySelector(".elapsed-time-text"))
        // start recording
        gifRecorder.startRecording();
        gifRecorder.getState();
        videoRecorder.startRecording();
        videoRecorder.getState();
    });

    // event for the camera button
    checkBoxCaptureCamBtn.addEventListener('click', () => {
        passStreamToVideo(windowBoxes[2].querySelector(".video-box"), stream);
        if (flag === true) {
            switchGifScreen(windowBoxes[1], windowBoxes[2]);
        };
        // start timer
        startTimer(windowBoxes[2].querySelector(".elapsed-time-text"));
        // start recording
        gifRecorder.startRecording();
        gifRecorder.getState();
        videoRecorder.startRecording();
        videoRecorder.getState();
    });
};

function stopVideoRecording(stream, gifRecorder, videoRecorder) {
    recordBoxRecordBtn.addEventListener('click', () => {
        videoRecorder.stopRecording(() => {
            let videoBlob = videoRecorder.getBlob();
            let videoElement = windowBoxes[3].querySelector(".video-box");
            videoElement.src = URL.createObjectURL(videoBlob);
        });
        gifRecorder.stopRecording(() => {
            stopTimer(windowBoxes[2].querySelector(".elapsed-time-text").innerText, windowBoxes[3].querySelector(".elapsed-time-text"));
            switchGifScreen(windowBoxes[2], windowBoxes[3]);
            let gifBlob = gifRecorder.getBlob();
            /*let gifElement = windowBoxes[3].querySelector(".image-box")
            gifElement.src = URL.createObjectURL(blob);*/
            /*let videoElement = windowBoxes[3].querySelector(".video-box");
            videoElement.src = URL.createObjectURL(blob);*/
            // checks which button is pressed so you either upload the gif or restart capture
            //destroyRecorder(videoRecorder);
            uploadOrRestartCapture(gifBlob, stream, gifRecorder, videoRecorder);
        });
    });
};

function abortGifUpload(controller) {
    document.getElementById("uploading-btn-cancel").addEventListener("click", () => {
        controller.abort();
        console.log('Upload aborted by user');
        alert(`Se abortó el upload del guifo. Para reintentar, presione Crear Guifos`);
        killVideoStreams();
        hideAllGifScreens();
    });
    let closeIcons = document.querySelectorAll(".close");
    closeIcons[4].addEventListener("click", () => {
        controller.abort();
        console.log('Upload aborted by user');
        alert(`Se abortó el upload del guifo. Para reintentar, presione Crear Guifos`);
        killVideoStreams();
        hideAllGifScreens();
    });
}

function uploadOrRestartCapture(blob, stream, gifRecorder, videoRecorder) {
    let previewButtonsBar = windowBoxes[3].querySelector(".window-buttons");
    const downloadGifButton = document.querySelector("#uploaded-btn-download");

    previewButtonsBar.querySelector("#preview-btn-upload").onclick = () => {
        if (isGifUploaded === false) {
            //isGifUploaded = true;
            console.log("upload");
            saveRecording(blob, gifRecorder, videoRecorder);
        }
    };
    previewButtonsBar.querySelector("#preview-btn-repeat").addEventListener('click', () => {
        console.log("repeat capture");
        previewButtonsBar.querySelector("#preview-btn-upload").onclick = null;
        restartRecording(stream, gifRecorder, false);
    });

    previewButtonsBar.querySelector("#progress-bar").addEventListener('click', () => {
        console.log("playback");
    });

    downloadGifButton.addEventListener("click", () => {
        saveFileToClient(blob);
    })
};

function copyUrlToClipboard(copyLinkButton, gifUrl) {
    copyLinkButton.addEventListener("click", () => {
        const myClipboardInput = document.createElement("input");
        myClipboardInput.value = gifUrl;
        myClipboardInput.id = "clipboard-input";
        document.body.appendChild(myClipboardInput);
        myClipboardInput.select();
        document.execCommand('copy');
        document.body.removeChild(myClipboardInput);
        copyLinkButton.innerText = "Enlace Copiado en el Portapapeles!";
        setTimeout(() => { copyLinkButton.innerText = "Copiar Enlace Guifo" }, 1000)
    })
}

function finishRecordingProcess(readyProcessButton, recorder) {
    readyProcessButton.addEventListener("click", () => {
        //alert("Video Stream Ended. Thanks for uploading your Guifo! To repeat refresh the page");
        alert("Gracias por subir su Guifo! Para repetir el proceso refresque la página.");
        hideAllGifScreens();
        destroyRecorder(recorder);
    });
}

function closeImageFinishRecordingProcess(recorder) {
    windowBoxes[5].querySelector(".close").addEventListener("click", () => {
        //alert("Video Stream Ended. Thanks for uploading your Guifo! To repeat refresh the page.");
        alert("Gracias por subir su Guifo! Para repetir el proceso refresque la página.");
        hideAllGifScreens();
        destroyRecorder(recorder);
    });
}

// ========================================================================================
// EVENTS
// ========================================================================================
// closes all the guifos app windows (Cancel Button)
createBoxCancelBtn.addEventListener('click', () => {
    hideAllGifScreens();
});

// starts the video stream for guifo creation and passes it to the video element in window 1
createBoxContinueBtn.addEventListener('click', () => {
    switchGifScreen(windowBoxes[0], windowBoxes[1]);
    console.log("start Camera Preview");
    let myVideo = createVideoStream(videoConstraints);
    myVideo
        .then(stream => {
            let previewVideoBox = windowBoxes[1].querySelector(".video-box");
            passStreamToVideo(previewVideoBox, stream);
            console.log("video capture preview started");
            const gifRecorder = RecordRTC(stream, { type: "gif" });
            const videoRecorder = RecordRTC(stream, { type: "video" });
            startVideoRecording(stream, gifRecorder, videoRecorder, true);
            stopVideoRecording(stream, gifRecorder, videoRecorder);
        })
        .catch(error => {
            console.log(error);
            if (error.name === "NotAllowedError") {
                alert("GifOS: Permisos al dispositivo de Usuario negados. Refresque la página para reintentar.");
            }
            if (error.name === "NotFoundError") {
                let alertString = `GifOS: No se ha encontrado WebCam. Revise la conexión `;
                alertString += `de su cámara y pruebe nuevamente clickeando sobre el botón "Crear Guifos".`;
                alert(`${alertString}`);
                hideAllGifScreens();
            }
        })
});

document.querySelector(".logo").addEventListener("click", () => {
    initializeGuifos();
    showGifScreen(windowBoxes[0]);
    isGifUploaded = false;
});

document.querySelector(".nav-button").addEventListener("click", () => {
    showGifScreen(windowBoxes[0]);
    isGifUploaded = false;
    localStorage.setItem("guifosApp", JSON.stringify({ isEnabled: true }));
});
document.querySelector(".nav-link").addEventListener("click", () => {
    hideAllGifScreens();
    localStorage.setItem("guifosApp", JSON.stringify({ isEnabled: false }));
});

let closeIcons = document.querySelectorAll(".close");
closeIcons.forEach((element, index) => {
    if (!element.classList.contains("nodisplay")) {
        element.addEventListener('click', () => {
            if (index !== 4) {
                hideAllGifScreens();
                alert(`Se cerró el proceso de captura de guifo. Será redireccionado a la página "Mis Guifos"`);
                localStorage.setItem("guifosApp", JSON.stringify({ isEnabled: false }));
                document.location.href = 'guifos.html';
            }
        });
    }
});