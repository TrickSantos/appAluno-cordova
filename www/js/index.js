document.addEventListener("deviceready", onDeviceReady, false);

let database = null;
let tarefas = new Map();

function onDeviceReady() {
  // Cordova está inicializado.
  console.log("Running cordova-" + cordova.platformId + "@" + cordova.version);
}

function carregarTarefas() {
  database
    .ref("tarefas/")
    .get()
    .then((snapshot) => {
      if (snapshot.exists()) {
        // lista.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
          const tarefa = childSnapshot.val();
          tarefa.key = childSnapshot.key;
          tarefas.set(tarefa.key, tarefa);
        });
      }
    });
}

function renderTarefas() {
  carregarTarefas();
  var lista = document.querySelector("#listaTarefas");
  lista.innerHTML = "";

  tarefas.forEach((tarefa) => {
    lista.appendChild(montaTabela(tarefa));
  });
}

function montaTabela(tarefa) {
  var key = tarefa.key;

  const foto = tarefa.foto
    ? tarefa.foto
    : "iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAIAAAADnC86AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wwJCB8v/9zErgAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAAvSURBVFjD7c0BDQAACAMgtX+KJzWGm4MCdJK6MHVELBaLxWKxWCwWi8VisVj8MV7qBgI2A8rYpgAAAABJRU5ErkJggg==";

  var item = document.createElement("ons-list-item");
  item.innerHTML = `
        <div class="list-item__left">
          <img class="list-item__thumbnail" src="data:image/png;base64,${foto}" alt="Cute kitten">
        </div>

        <div class="list-item__center">
          <div class="list-item__title">${tarefa.titulo}</div>
          <div class="list-item__subtitle">${tarefa.descricao}</div>
        </div>
        <div class="list-item__right">
          <ons-icon icon="md-delete" class="delete-icon"></ons-icon>
        </div>
        `;

  item.querySelector(".delete-icon").addEventListener("click", function () {
    ons
      .openActionSheet({
        title: "Deseja realmente apagar?",
        cancelable: true,
        buttons: [
          {
            label: "Apagar",
            modifier: "destructive",
          },
          {
            label: "Cancelar",
            icon: "md-close",
          },
        ],
      })
      .then(function (index) {
        if (index === 0) {
          deletarTarefa(key);
        }
      });
  });
  return item;
}

function deletarTarefa(key) {
  database
    .ref("tarefas/" + key)
    .remove()
    .then(function () {
      carregarTarefas();
      renderTarefas();
      ons.notification.toast("Tarefa deletada.", { timeout: 2000 });
    })
    .catch(function (error) {
      ons.notification.alert("Erro ao deletar tarefa.");
    });
}

function tirarFoto() {
  navigator.camera.getPicture(onSuccess, onFail, {
    quality: 50,
    destinationType: Camera.DestinationType.DATA_URL,
    targetWidth: 600,
    targetHeight: 600,
    correctOrientation: true,
  });

  function onSuccess(imageData) {
    var page = document.querySelector("#cadastro");
    var image = page.querySelector("#fotoPreview");
    if (image) {
      image.style.display = "block";
      image.src = "data:image/jpeg;base64," + imageData;
    }
    localStorage.setItem("fotoTarefa", imageData);
  }

  function onFail(message) {
    ons.notification.alert("Falha ao tirar foto: " + message);
  }
}

function salvarTarefa() {
  var page = document.querySelector("#cadastro");
  var titulo = page.querySelector("#titulo").value;
  var descricao = page.querySelector("#descricao").value;
  var data = page.querySelector("#data").value;
  var prioridade = page.querySelector("#prioridade").value;
  var foto = localStorage.getItem("fotoTarefa") || "";

  if (titulo && descricao && data && prioridade) {
    const id = new Date().getTime();
    const novaTarefa = {
      titulo: titulo,
      descricao: descricao,
      data: data,
      prioridade: prioridade,
      foto: foto,
    };

    database
      .ref(`tarefas/${id}`)
      .set(novaTarefa)
      .then(function () {
        ons.notification.toast("Tarefa salva.", { timeout: 2000 });
        page.querySelector("#titulo").value = "";
        page.querySelector("#descricao").value = "";
        page.querySelector("#data").value = "";
        page.querySelector("#prioridade").value = "";
        var image = page.querySelector("#fotoPreview");
        if (image) {
          image.style.display = "none";
        }
        localStorage.removeItem("fotoTarefa");
        carregarTarefas();
      })
      .catch(function (error) {
        ons.notification.alert("Erro ao salvar tarefa.");
      });
  } else {
    ons.notification.alert("Por favor, preencha todos os campos.");
  }
}

ons.ready(function () {
  // Inicialize o Firebase com as credenciais do seu projeto
  const firebaseConfig = {
    apiKey: "AIzaSyB-5aRbrNCIeKtCVfNK4rCj9rAuQ95UrKk",
    authDomain: "appaluno-2cbf0.firebaseapp.com",
    projectId: "appaluno-2cbf0",
    storageBucket: "appaluno-2cbf0.firebasestorage.app",
    messagingSenderId: "674334619794",
    appId: "1:674334619794:web:893ebd0933b50798590e4b",
    databaseURL: "https://appaluno-2cbf0-default-rtdb.firebaseio.com/",
  };

  const fb = firebase.initializeApp(firebaseConfig);
  database = fb.database();
  carregarTarefas();
});

document.addEventListener("init", function (event) {
  var page = event.target;

  if (page.id === "listagem") {
    carregarTarefas();
  }

  if (page.id === "cadastro") {
    const btnSalvar = page.querySelector("#btnSalvar");

    if (btnSalvar) {
      btnSalvar.addEventListener("click", salvarTarefa);
    }

    const btnTirarFoto = page.querySelector("#btnTirarFoto");

    if (btnTirarFoto) {
      btnTirarFoto.addEventListener("click", tirarFoto);
    }
  }
});

document.addEventListener("show", function (event) {
  var page = event.target;

  if (page.id === "listagem") {
    renderTarefas();
  }
});
