async function setRenderBackground(){
    // binary large object
    const result = await axios.get("https://picsum.photos/1280/720",{
        responseType:"blob"
    });

    const data = URL.createObjectURL(result.data);
    document.querySelector("body").style.backgroundImage = `url(${data})`;

}

function setComment(hello){
    const comment = document.querySelector(".timer-content").querySelector("span");
    comment.textContent = hello;
}

// 시계 설정함수
function setTime(){
    const timer = document.querySelector(".timer");
    setInterval(()=>{
        const date = new Date();
        timer.textContent = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        if(date.getHours() >= 0 && date.getHours() < 12){
            setComment("Morning");
        }
        else{
            setComment("Evening");
        }
    },1000);
}

// memo 불러오기
function getMemo(){
    const memo = document.querySelector(".memo");
    const memoValue = localStorage.getItem("todo");
    memo.textContent = memoValue;
}

// memo 저장
function setMemo(){
    const memoInput = document.querySelector(".memo-input");
    memoInput.addEventListener("keyup",function(e){
        // console.log(e.code);
        // console.log(e.target.value);

        if(e.code === 'Enter' && e.target.value){
            localStorage.setItem('todo',e.target.value);
            getMemo();
            memoInput.value="";
        }

    })
}

// memo 삭제
function deleteMemo(){
    document.addEventListener("click",function(e){
        // console.log(e.target);
        if(e.target.classList.contains("memo")){
            // localStorage item 삭제
            localStorage.removeItem("todo");
            // memo html 비워주기
            e.target.textContent = "";
        }
    })
}

function memos(){
    setMemo();
    getMemo();
    deleteMemo();
}

// 위도 경도 가져오기 -> promise
function getPosition(options){
    return new Promise(function(resolve,reject){
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
}

async function getWeather(latitude,longitude){
    if(latitude && longitude){
        const data = await axios.get(
            `http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=4dfbbb486023defd7e5edc11337ae237`
        )
        return data;
    }
    const data = await axios.get(`http://api.openweathermap.org/data/2.5/forecast?q=Seoul&appid=4dfbbb486023defd7e5edc11337ae237`);
    return data;
}

function matchIcon(weatherData){
    if (weatherData === "Clear") return './images/039-sun.png';
    if (weatherData === "Clouds") return './images/001-cloud.png';
    if (weatherData === "Rain") return './images/003-rainy.png';
    if (weatherData === "Snow") return './images/006-snowy.png';
    if (weatherData === "Thunderstorm") return './images/008-storm.png';
    if (weatherData === "Drizzle") return './images/031-snowflake.png';
    if (weatherData === "Atmosphere") return './images/033-hurricane.png';
}

function weatherWrapperComponent(li){
    // console.log(li);
    // console.log(li.main.temp)
    const changeToCelsius = (temp) => (temp - 273.15).toFixed(1);
    return `
    <div class="card shadow-sm bg-transparent mb-3 m-2 flex-grow-1">
    <div class="card-header text-white text-center">
    ${li.dt_txt.split(" ")[0]}
    </div>
    
    <div class="card-body d-flex">
    <div class="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
        <h5 class="card-title">
            ${li.weather[0].main}
        </h5>
        <img src="${matchIcon(li.weather[0].main)}" width="60px" height="60px"/>
        <p class="card-text">${changeToCelsius(li.main.temp)}</p>
    </div>
    </div>
    </div>
    `
}


// 위도와 경도를 받아서 데이터 받아오기
async function renderWeather(){
    let latitude = "";
    let longitude = "";
    
    try{
        const position = await getPosition();
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
    }
    catch(err){
        console.log(err);
    }
    const weatherResponse = await getWeather(latitude,longitude);
    const weatherData = weatherResponse.data;
    // console.log(weatherData);
    const weatherList = weatherData.list.reduce((acc,cur)=>{
        if(cur.dt_txt.indexOf("18:00:00")>0){
            acc.push(cur);
        }
        return acc;
    },[]);
    // console.log(weatherList);
    const modalButton = document.querySelector(".modal-button");
    modalButton.style.backgroundImage = `url(${matchIcon(weatherList[0].weather[0].main)})`;
    const modalBody = document.querySelector(".modal-body");
    modalBody.innerHTML = weatherList.map(li=>{
        return weatherWrapperComponent(li);
    }).join(" ");
}



(function (){
    setRenderBackground();
    setInterval(()=>{
        setRenderBackground();
    },5000);
    setTime();
    memos();
    renderWeather();
})();