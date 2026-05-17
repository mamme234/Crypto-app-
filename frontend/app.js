"none";

  document.getElementById("game")
  .classList.remove("hidden");
}

function updateUI(){

  document.getElementById("money")
  .innerText = money;

  document.getElementById("rep")
  .innerText = reputation;

  document.getElementById("energy")
  .innerText = energy;

  localStorage.setItem("money", money);

  localStorage.setItem("rep", reputation);

  localStorage.setItem("energy", energy);
}

function doMission(type){

  if(energy <= 0){

    document.getElementById("storyText")
    .innerText =
    "You are too tired.";

    return;
  }

  if(type === "street"){

    money += 100;
    reputation += 1;
    energy -= 10;

    document.getElementById("storyText")
    .innerText =
    "You completed a street deal mission.";
  }

  if(type === "fight"){

    money += 250;
    reputation += 3;
    energy -= 20;

    document.getElementById("storyText")
    .innerText =
    "You survived a dangerous fight.";
  }

  if(type === "boss"){

    money += 600;
    reputation += 6;
    energy -= 35;

    document.getElementById("storyText")
    .innerText =
    "Demir trusted you with a mafia mission.";
  }

  updateUI();
}

setInterval(()=>{

  if(energy < 100){

    energy += 1;

    updateUI();
  }

},5000);

updateUI();
