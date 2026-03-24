const gato6 = document.getElementById("gato6")
const botao = document.getElementById("cookie")

const estados = {
    normal: "/img/6.png",
    trabalhando: "/img/1.png",
    estudando: "/img/2.png",
    amavel: "/img/3.png",
    iniSono: "/img/5.png",
    dormindo: "/img/4.png",
    acordando: "/img/7.png",
}

let contador = 0;
let intervalo = null;
let time_click = null;
let time_out = null;

function controlador(){
    if (intervalo) clearInterval(intervalo)
        intervalo = setInterval(() => {
            contador++;

            console.log("Tempo: ", contador);

            if (contador == 30) {
                gato6.src = estados.iniSono
            }

            if (contador == 60) {
                gato6.src = estados.dormindo
            }
    }, 100) 
}

controlador();