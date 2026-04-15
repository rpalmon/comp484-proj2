
var pets = [];
var activePetId = null;

$(function() {
  initializePetState();
  renderPetTabs();
  checkAndUpdatePetInfoInHtml();
  renderActivityLog();

  $('.treat-button').click(clickedTreatButton);
  $('.play-button').click(clickedPlayButton);
  $('.exercise-button').click(clickedExerciseButton);
  $('.reset').click(resetPet);

  $('.add-pet-button').click(createPetFromTabs);

  // Use event delegation because pet tabs are generated dynamically.
  $('.pet-tabs-list').on('click', '.pet-tab-button', function() {
    var selectedPetId = $(this).attr('data-pet-id');
    setActivePet(selectedPetId);
  });
});

function createDefaultPet(name) {
  return {
    id: Date.now().toString() + Math.random().toString(16).slice(2),
    name: name || 'My Pet Name',
    weight: 0,
    happiness: 0,
    image: '/images/dino.webp',
    activity_log: []
  };
}

function initializePetState() {
  var storedPets = localStorage.getItem('pets');
  var storedActivePetId = localStorage.getItem('active_pet_id');

  if (storedPets) {
    pets = JSON.parse(storedPets) || [];
  } else {
    // Migrate old single-pet storage to the new multi-pet format.
    var oldPetInfo = JSON.parse(localStorage.getItem('pet_info'));
    var oldActivityLog = JSON.parse(localStorage.getItem('activity_log')) || [];

    if (oldPetInfo) {
      var migratedPet = createDefaultPet(oldPetInfo.name || 'My Pet Name');
      migratedPet.weight = oldPetInfo.weight || 0;
      migratedPet.happiness = oldPetInfo.happiness || 0;
      migratedPet.activity_log = oldActivityLog;
      pets = [migratedPet];
    }
  }

  if (!pets.length) {
    pets = [createDefaultPet('My Pet Name')];
  }

  activePetId = storedActivePetId;
  if (!getActivePet()) {
    activePetId = pets[0].id;
  }

  persistPets();
}

function getActivePet() {
  for (var i = 0; i < pets.length; i++) {
    if (pets[i].id === activePetId) {
      return pets[i];
    }
  }
  return null;
}

function persistPets() {
  localStorage.setItem('pets', JSON.stringify(pets));
  localStorage.setItem('active_pet_id', activePetId);
}

function renderPetTabs() {
  var $tabsList = $('.pet-tabs-list');
  $tabsList.empty();

  pets.forEach(function(pet) {
    var isActive = pet.id === activePetId;
    var $tabButton = $('<button type="button" class="pet-tab-button" role="tab"></button>');
    $tabButton.text(pet.name);
    $tabButton.attr('data-pet-id', pet.id);
    $tabButton.attr('aria-selected', isActive ? 'true' : 'false');

    if (isActive) {
      $tabButton.addClass('active');
    }

    $tabsList.append($tabButton);
  });
}

function setActivePet(petId) {
  activePetId = petId;
  persistPets();
  renderPetTabs();
  checkAndUpdatePetInfoInHtml();
  renderActivityLog();
}

function createPetFromTabs() {
  var suggestedName = 'Pet ' + (pets.length + 1);
  var petName = prompt('Name your new pet:', suggestedName);

  if (petName === null) {
    return;
  }

  petName = $.trim(petName);
  if (!petName) {
    petName = suggestedName;
  }

  var newPet = createDefaultPet(petName);
  pets.push(newPet);
  activePetId = newPet.id;

  persistPets();
  renderPetTabs();
  checkAndUpdatePetInfoInHtml();
  renderActivityLog();
}

function renderActivityLog() {
  var pet = getActivePet();
  $('.activity-list').empty();

  if (!pet) {
    return;
  }

  for (var i = pet.activity_log.length - 1; i >= 0; i--) {
    $('.activity-list').append('<li>' + pet.activity_log[i] + '</li>');
  }
}

function updateActivityLog(action) {
  var pet = getActivePet();
  if (!pet) {
    return;
  }

  var currentDateTime = getCurrentDateTime();
  var activityLogEntry = currentDateTime + ': ' + action;
  $('.activity-list').prepend('<li>' + activityLogEntry + '</li>');
  pet.activity_log.push(activityLogEntry);
  persistPets();
}

function resetPet() {
  var pet = getActivePet();
  if (!pet) {
    return false;
  }

  if (confirm('Are you sure you want to reset this pet? This will clear its progress and activity log.')) {
    pet.weight = 0;
    pet.happiness = 0;
    pet.activity_log = [];
    $('.activity-list').empty();
    persistPets();
    checkAndUpdatePetInfoInHtml();
  } else {
    return false;
  }
}

function getCurrentDateTime() {
  var currentDate = new Date();
  var date = currentDate.getDate();
  var month = currentDate.getMonth() + 1;
  var year = currentDate.getFullYear();
  var hours = currentDate.getHours();
  var minutes = currentDate.getMinutes();
  var seconds = currentDate.getSeconds();

  return month + '/' + date + '/' + year + ' ' + hours + ':' + minutes + ':' + seconds;
}

function clickedTreatButton() {
  var pet = getActivePet();
  if (!pet) {
    return;
  }

  pet.happiness += 10;
  pet.weight += 5;
  updateActivityLog('Gave a treat. <happiness>Happiness increased by 10</happiness>, <weight>weight increased by 5</weight>.');
  checkAndUpdatePetInfoInHtml();
}

function clickedPlayButton() {
  var pet = getActivePet();
  if (!pet) {
    return;
  }

  pet.happiness += 5;

  if (pet.weight > 0) {
    pet.weight -= 2;
    var petImage = $('.pet-image');
    petImage.removeClass('spin');
    void petImage[0].offsetWidth;
    petImage.addClass('spin');
    setTimeout(function() {
      petImage.removeClass('spin');
    }, 1000);

    updateActivityLog('Played with pet. <happiness>Happiness increased by 5</happiness>, <weight>weight decreased by 2</weight>.');
  } else {
    console.warn('Pet weight cannot be negative');
    updateActivityLog('<error>Tried to play with pet, but weight cannot be negative. No changes made.</error>');
    return false;
  }

  checkAndUpdatePetInfoInHtml();
}

function clickedExerciseButton() {
  var pet = getActivePet();
  if (!pet) {
    return;
  }

  if (pet.happiness === 0 && pet.weight === 0) {
    console.warn('Pet happiness or weight cannot be negative');
    updateActivityLog('<error>Tried to exercise pet, but both stats are already at 0. No changes made.</error>');
    return false;
  }

  pet.happiness -= 5;
  pet.weight -= 3;
  checkAndUpdatePetInfoInHtml();
  updateActivityLog('Exercised pet. <happiness>Happiness decreased by 5</happiness>, <weight>weight decreased by 3</weight>.');
}

function checkAndUpdatePetInfoInHtml() {
  checkWeightAndHappinessBeforeUpdating();
  updatePetInfoInHtml();
  persistPets();
}

function checkWeightAndHappinessBeforeUpdating() {
  var pet = getActivePet();
  if (!pet) {
    return;
  }

  if (pet.weight < 0) {
    pet.weight = 0;
  }

  if (pet.happiness < 0) {
    pet.happiness = 0;
  }
}

function updatePetInfoInHtml() {
  var pet = getActivePet();
  if (!pet) {
    return;
  }

  $('.name').text(pet.name);
  $('.weight').text(pet.weight);
  $('.happiness').text(pet.happiness);
  $('.pet-image').attr('src', pet.image);
  $('.pet-image').attr('alt', pet.name + ' image');
}
  