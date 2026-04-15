
// Pet stat change constants
var treatHappiness = 10;
var treatWeight = 5;
var playHappiness = 5;
var playWeight = 2;
var exerciseHappiness = 5;
var exerciseWeight = 3;

var pets = [];
var activePetId = null;

$(function() {
  initializePetState();
  renderPetTabs();
  checkAndUpdatePetInfoInHtml();
  renderActivityLog();

  // Attach click handlers for action buttons
  $('.treat-button').click(clickedTreatButton);
  $('.play-button').click(clickedPlayButton);
  $('.exercise-button').click(clickedExerciseButton);
  $('.reset').click(resetPet);
  $('.edit-name-button').click(addEditNameInput); 
    

  $('.add-pet-button').click(createPetFromTabs);

  // Event delegation for pet tab buttons (dynamically generated)
  $('.pet-tabs-list').on('click', '.pet-tab-button', function() {
    var selectedPetId = $(this).attr('data-pet-id');
    setActivePet(selectedPetId);
  });
});

// Create a new pet object with default values
// The ID is generated using the current timestamp and a random string to ensure uniqueness.
function createDefaultPet(name) {
  return {
    id: Date.now().toString() + Math.random().toString(16).slice(2),
    name: name || 'My Pet Name',
    weight: 0,
    happiness: 0,
    image: 'images/dino.webp',
    activity_log: []
  };
}

// Ensure image URLs are GitHub Pages-safe for project deployments.
function normalizePetImagePath(imagePath) {
  if (!imagePath) {
    return 'images/dino.webp';
  }

  // Convert site-root absolute paths (e.g., /images/dino.webp) to relative paths.
  if (imagePath.charAt(0) === '/') {
    return imagePath.substring(1);
  }

  return imagePath;
}

// Initialize the pet by loading from localstorage if it exists, or creating a new pet if not.
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

  pets.forEach(function(pet) {
    pet.image = normalizePetImagePath(pet.image);
  });

  activePetId = storedActivePetId;
  if (!getActivePet()) {
    activePetId = pets[0].id;
  }

  persistPets();
}

//gets the currently active pet object based on the activePetId, or returns null if not found
function getActivePet() {
  for (var i = 0; i < pets.length; i++) {
    if (pets[i].id === activePetId) {
      return pets[i];
    }
  }
  return null;
}

// Save the current state of pets and active pet ID to localStorage
function persistPets() {
  localStorage.setItem('pets', JSON.stringify(pets));
  localStorage.setItem('active_pet_id', activePetId);
}

//display the pet tabs based on the current pets array and active pet ID
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

    //append the tab button to the tabs list
    $tabsList.append($tabButton);
  });
}

// Set the active pet based on the clicked tab and update the UI accordingly
function setActivePet(petId) {
  activePetId = petId;
  persistPets();
  renderPetTabs();
  checkAndUpdatePetInfoInHtml();
  renderActivityLog();
}

// Create a new pet based on user input and add it to the pets array, then update the UI
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
    // Prepend each log entry so the most recent activity appears at the top of the list.
    $('.activity-list').append('<li>' + pet.activity_log[i] + '</li>');
  }
}

// Add a new entry to the activity log for the active pet, including a timestamp, then persist the changes and update the UI
function updateActivityLog(action) {
  var pet = getActivePet();
  if (!pet) {
    return;
  }

  var currentDateTime = getCurrentDateTime();
  var activityLogEntry = '<timestamp>' + currentDateTime + '</timestamp> ' + action;
  $('.activity-list').prepend('<li>' + activityLogEntry + '</li>');
  pet.activity_log.push(activityLogEntry);
  persistPets();
}

// Update the pet's name based on user input, then update the UI and persist the changes
function editPetName(oldName, newName) {
  var pet = getActivePet();
  if (!pet) {
    return false;
  }

  pet.name = newName;
  persistPets();
  checkAndUpdatePetInfoInHtml();
  renderPetTabs();
  
  // Log the name change with both old and new names
  updateActivityLog('<changedName>Name changed from ' + oldName + ' to ' + newName + '</changedName>');
  $('changedName').css('color', 'blue');
  return true;
}

// Remove the edit name input and cancel button, and re-enable the edit button
function cancelNameEdit() {
  $('.edit-name-input').remove();
  $('.cancel-edit-name-button').remove();
  $('.edit-name-button').prop('disabled', false);
}

//Get the new name from the input, validate it, 
//then call editPetName to update the pet's name and cancel the edit mode
function submitNameEdit() {
  var oldName = getActivePet().name;
  var newName = $.trim($('.edit-name-input').val());
  
  if (!newName) {
    return;
  }
  
  editPetName(oldName, newName);
  cancelNameEdit();
}

// Add a text input for editing the pet's name, along with a cancel button, 
// and disable the edit button to prevent multiple inputs
function addEditNameInput() {
  var currentName = getActivePet().name;
  
  // Add text input below name with current name as placeholder
  $('#pet-name').append('<input type="text" class="edit-name-input" placeholder="' + currentName + '">');
  $('.edit-name-input').focus();
  
  // Add cancel button
  $('#pet-name').append('<button class="cancel-edit-name-button button">Cancel</button>');
  
  // Prevent multiple edit inputs by disabling the edit button
  $('.edit-name-button').prop('disabled', true);
  
  // Cancel button handler
  $('.cancel-edit-name-button').click(cancelNameEdit);
  
  // Enter key handler to submit the name change
  $('.edit-name-input').keypress(function(e) {
    if (e.which === 13) {
      submitNameEdit();
      return false;
    }
  });
}

//Reset the active pet's weight, happiness, and activity log to their default values,
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

//gets current date and time in the format MM/DD/YYYY HH:MM:SS AM/PM
function getCurrentDateTime() {
  var currentDate = new Date();
  var date = currentDate.getDate();
  var month = currentDate.getMonth() + 1;
  var year = currentDate.getFullYear();
  var hours = currentDate.getHours();
  var minutes = currentDate.getMinutes();
  var seconds = currentDate.getSeconds();

  var amPm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  
  // Pad minutes and seconds with leading zeros
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;

  return month + '/' + date + '/' + year + ' ' + hours + ':' + minutes + ':' + seconds + ' ' + amPm;
}

//clicked treat button increases happiness by 10 and weight by 5, 
//then updates the activity log and pet info in HTML
function clickedTreatButton() {
  var pet = getActivePet();
  if (!pet) {
    return;
  }

  pet.happiness += treatHappiness;
  pet.weight += treatWeight;
  updateActivityLog('Gave a treat. <happiness>Happiness increased by ' + treatHappiness + '</happiness>, <weight>Weight increased by ' + treatWeight + '</weight>.');
  checkAndUpdatePetInfoInHtml();
}

//clicked play button increases happiness by 5 and decreases weight by 2,
//then updates the activity log and pet info in HTML
function clickedPlayButton() {
  var pet = getActivePet();
  if (!pet) {
    return;
  }

  pet.happiness += playHappiness;

  if (pet.weight > 0) {
    pet.weight -= playWeight;
    var petImage = $('.pet-image');
    petImage.removeClass('spin');
    void petImage[0].offsetWidth;
    petImage.addClass('spin');
    setTimeout(function() {
      petImage.removeClass('spin');
    }, 1000);

    updateActivityLog('Played with pet. <happiness>Happiness increased by ' + playHappiness + '</happiness>, <weight-decreased>Weight decreased by ' + playWeight + '</weight-decreased>.');
  } else {
    console.warn('Cannot play: pet weight is already at 0');
    updateActivityLog('<error>Tried to play with pet, but weight is already at 0. No changes made.</error>');
    return false;
  }

  checkAndUpdatePetInfoInHtml();
}

//clicked exercise button decreases happiness by 5 and decreases weight by 3,
//then updates the activity log and pet info in HTML
function clickedExerciseButton() {
  var pet = getActivePet();
  if (!pet) {
    return;
  }

  if (pet.weight <= 0) {
    console.warn('Cannot exercise: pet weight is already at 0');
    updateActivityLog('<error>Tried to exercise pet, but weight is already at 0. No changes made.</error>');
    return false;
  }

  pet.happiness -= exerciseHappiness;
  pet.weight -= exerciseWeight;
  checkAndUpdatePetInfoInHtml();
  updateActivityLog('Exercised pet. <happiness-decreased>Happiness decreased by ' + exerciseHappiness + '</happiness-decreased>, <weight-decreased>Weight decreased by ' + exerciseWeight + '</weight-decreased>.');
}

// Check that weight and happiness are not negative before updating the HTML, 
// then update the pet info in the HTML and persist the changes
function checkAndUpdatePetInfoInHtml() {
  checkWeightAndHappinessBeforeUpdating();
  updatePetInfoInHtml();
  persistPets();
}

// Ensure that weight and happiness values do not go below 0 before updating the HTML
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

// Update the pet info in the HTML based on the active pet's current state,
//  including name, weight, happiness, and image
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
  