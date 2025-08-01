const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let bgImg = null;
let productImg = null;

let dragging = null;
let offsetX = 0;
let offsetY = 0;

let product = {
  x: 100,
  y: 400,
  width: 200,
  height: 200
};

let titleText = {
  x: 500,
  y: 90,
  fontSize: 32
};

let priceText = {
  x: 540,
  y: 410,
  fontSize: 32
};

function drawCanvas() {
  if (!bgImg) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  if (productImg) {
    ctx.drawImage(productImg, product.x, product.y, product.width, product.height);
  }

  const title = document.getElementById("productTitle").value;
  ctx.font = `bold ${titleText.fontSize}px Arial`;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(title, titleText.x, titleText.y);

  const price = document.getElementById("productPrice").value;
  ctx.font = `bold ${priceText.fontSize}px Arial`;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(price, priceText.x, priceText.y);

  const extra = document.getElementById("extraText").value;
  ctx.font = "bold 24px Arial";
  ctx.fillStyle = "#ffcc00";
  ctx.fillText(extra, 50, 720);
}

// Fundo
document.getElementById("bgImage").addEventListener("change", function (e) {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = function (event) {
    bgImg = new Image();
    bgImg.onload = drawCanvas;
    bgImg.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

// Produto
document.getElementById("productImage").addEventListener("change", function (e) {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = function (event) {
    productImg = new Image();
    productImg.onload = drawCanvas;
    productImg.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

// Arrastar
canvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  if (
    mouseX > product.x &&
    mouseX < product.x + product.width &&
    mouseY > product.y &&
    mouseY < product.y + product.height
  ) {
    dragging = "product";
    offsetX = mouseX - product.x;
    offsetY = mouseY - product.y;
    return;
  }

  if (mouseX > titleText.x && mouseX < titleText.x + 300 && mouseY < titleText.y && mouseY > titleText.y - titleText.fontSize) {
    dragging = "title";
    offsetX = mouseX - titleText.x;
    offsetY = mouseY - titleText.y;
    return;
  }

  if (mouseX > priceText.x && mouseX < priceText.x + 200 && mouseY < priceText.y && mouseY > priceText.y - priceText.fontSize) {
    dragging = "price";
    offsetX = mouseX - priceText.x;
    offsetY = mouseY - priceText.y;
    return;
  }
});

canvas.addEventListener("mouseup", () => {
  dragging = null;
});

canvas.addEventListener("mousemove", (e) => {
  if (!dragging) return;
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  if (dragging === "product") {
    product.x = mouseX - offsetX;
    product.y = mouseY - offsetY;
  } else if (dragging === "title") {
    titleText.x = mouseX - offsetX;
    titleText.y = mouseY - offsetY;
  } else if (dragging === "price") {
    priceText.x = mouseX - offsetX;
    priceText.y = mouseY - offsetY;
  }

  drawCanvas();
});

canvas.addEventListener("wheel", (e) => {
  if (!dragging) return;
  e.preventDefault();
  const scale = e.deltaY < 0 ? 1.05 : 0.95;

  if (dragging === "product") {
    product.width *= scale;
    product.height *= scale;
  } else if (dragging === "title") {
    titleText.fontSize = Math.max(10, titleText.fontSize * scale);
  } else if (dragging === "price") {
    priceText.fontSize = Math.max(10, priceText.fontSize * scale);
  }

  drawCanvas();
});

function gerarImagem() {
  if (!bgImg || !productImg) {
    alert("Envie imagem de fundo e do produto.");
    return;
  }

  drawCanvas();

  const downloadBtn = document.getElementById("downloadBtn");
  downloadBtn.href = canvas.toDataURL("image/png");
  downloadBtn.style.display = "inline-block";
}

function selecionarFundo(valor) {
  if (valor === "upload") return;

  const bgImageInput = document.getElementById("bgImage");
  bgImageInput.value = "";

  bgImg = new Image();
  bgImg.crossOrigin = "anonymous";
  bgImg.onload = drawCanvas;
  bgImg.src = valor;
}

// ✅ Função para remover fundo da imagem do produto
function removerFundoProduto() {
  const fileInput = document.getElementById("productImage");
  const file = fileInput.files[0];
  if (!file) {
    alert("Envie uma imagem primeiro.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    fetch("https://api.developer.pixelcut.ai/v1/remove-background", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-API-KEY": "sk_2356f9da3309430387e77badd9a12969"
      },
      body: JSON.stringify({
        image_url: e.target.result,
        format: "png"
      })
    })
      .then(res => res.json())
      .then(data => {
        if (!data || !data.url) throw new Error("Erro ao obter imagem sem fundo.");

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          productImg = img;
          drawCanvas();
        };
        img.src = data.url;
      })
      .catch(err => {
        console.error("Erro:", err);
        alert("Erro ao remover fundo.");
      });
  };
  reader.readAsDataURL(file);
}
