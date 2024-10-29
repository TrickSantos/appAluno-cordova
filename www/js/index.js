document.addEventListener("deviceready", onDeviceReady, false);

let db = null;

function onDeviceReady() {
  // Cordova is now initialized. Have fun!

  console.log("Running cordova-" + cordova.platformId + "@" + cordova.version);

  document.getElementById("btnSalvar").onclick = salvarTarefa;
  document.getElementById("btnTirarFoto").onclick = tirarFoto;
}

ons.ready(function () {
  // Inicialize o Firebase com as credenciais do seu projeto
  const firebaseConfig = {
    apiKey: "AIzaSyB-5aRbrNCIeKtCVfNK4rCj9rAuQ95UrKk",
    authDomain: "appaluno-2cbf0.firebaseapp.com",
    projectId: "appaluno-2cbf0",
    storageBucket: "appaluno-2cbf0.appspot.com",
    messagingSenderId: "674334619794",
    appId: "1:674334619794:web:893ebd0933b50798590e4b",
  };

  firebase.initializeApp(firebaseConfig);
  carregarTarefas();
});

function tirarFoto() {
  navigator.camera.getPicture(onSuccess, onFail, {
    quality: 50,
    destinationType: Camera.DestinationType.DATA_URL,
    targetWidth: 600,
    targetHeight: 600,
    correctOrientation: true,
  });

  function onSuccess(imageData) {
    var image = document.getElementById("fotoPreview");
    image.style.display = "block";
    image.src = "data:image/jpeg;base64," + imageData;
    localStorage.setItem("fotoTarefa", imageData);
  }

  function onFail(message) {
    ons.notification.alert("Falha ao tirar foto: " + message);
  }
}

function salvarTarefa() {
  var titulo = document.getElementById("titulo").value;
  var descricao = document.getElementById("descricao").value;
  var data = document.getElementById("data").value;
  var prioridade = document.getElementById("prioridade").value;
  var foto = localStorage.getItem("fotoTarefa") || "";

  console.log("click");

  if (titulo && descricao && data && prioridade) {
    const novaTarefa = {
      titulo: titulo,
      descricao: descricao,
      data: data,
      prioridade: prioridade,
      foto: foto,
    };

    console.log(novaTarefa);

    firebase
      .database()
      .ref("tarefas/")
      .push(novaTarefa)
      .then(function () {
        ons.notification.toast("Tarefa salva.", { timeout: 2000 });
        document.getElementById("titulo").value = "";
        document.getElementById("descricao").value = "";
        document.getElementById("data").value = "";
        document.getElementById("prioridade").value = "";
        document.getElementById("fotoPreview").style.display = "none";
        localStorage.removeItem("fotoTarefa");
      })
      .catch(function (error) {
        ons.notification.alert("Erro ao salvar tarefa.");
      });
  } else {
    ons.notification.alert("Por favor, preencha todos os campos.");
  }
}

document.addEventListener("init", function (event) {
  if (event.target.id === "listagem") {
    carregarTarefas();
  }
});

function carregarTarefas() {
  var lista = document.getElementById("listaTarefas");
  lista.innerHTML = "";

  firebase
    .database()
    .ref("tarefas/")
    .on("value", function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var tarefa = childSnapshot.val();
        var key = childSnapshot.key;

        var item = document.createElement("ons-list-item");
        item.innerHTML = `
        <div class="center">
          <span class="list-item__title">${tarefa.titulo}</span>
          <span class="list-item__subtitle">${tarefa.descricao}</span>
        </div>
        <div class="right">
          <ons-icon icon="md-delete" class="delete-icon" onclick="deletarTarefa('${key}')"></ons-icon>
        </div>
      `;
        lista.appendChild(item);
      });
    });
}

function deletarTarefa(key) {
  firebase
    .database()
    .ref("tarefas/" + key)
    .remove()
    .then(function () {
      ons.notification.toast("Tarefa deletada.", { timeout: 2000 });
    })
    .catch(function (error) {
      ons.notification.alert("Erro ao deletar tarefa.");
    });
}
