
Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(start)

async function start() {
  document.body.append('wait please')
  
  const container = document.createElement('div')
  container.style.position = 'relative'
  document.body.append(container)
  const labeledFaceDescriptors = await loadLabeledImages()
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
  
  let image
  let canvas
  document.body.append('Loaded')
  // 파일명
  var input = document.createElement("input");
  input.setAttribute("class", "upload-name");
  input.setAttribute("value", "파일선택");
  input.setAttribute("disabled", "disabled");
  document.body.appendChild(input); 

  // 라벨
  var label = document.createElement("label"); 
  label.innerHTML = "업로드";
  label.setAttribute("for", "imageUpload");
  document.body.appendChild(label); 
  
  // 버튼
  var fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.id = "imageUpload";
  fileInput.className = "upload-hidden"
  document.body.appendChild(fileInput);
  // 'filebox' 클래스를 가진 div 선택
  var fileboxDiv = document.querySelector(".filebox");

  // 선택한 div에 라벨과 입력 필드 추가
  fileboxDiv.appendChild(input);
  fileboxDiv.appendChild(label);
  fileboxDiv.appendChild(fileInput);
  
  const imageUpload = document.getElementById('imageUpload')

  imageUpload.addEventListener('change', async () => {
    if (image) image.remove()
    if (canvas) canvas.remove()
    image = await faceapi.bufferToImage(imageUpload.files[0])
    container.append(image)
    canvas = faceapi.createCanvasFromMedia(image)
    container.append(canvas)
    const displaySize = { width: image.width, height: image.height }
    faceapi.matchDimensions(canvas, displaySize)
    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box
      const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
      drawBox.draw(canvas)
    })
  })
}
function loadLabeledImages() {
  const labels = ['김형진','오인석','이석윤']
  return Promise.all(
    labels.map(async label => {
      const descriptions = []
      for (let i = 1; i <= 2; i++) {
        const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/anulabgit/-anulabgit-digital_image_processing5/main/faceimg-main/labeled_images/${label}/${i}.jpg`)
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(detections.descriptor)
      }
      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}
