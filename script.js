
$(function() { // Makes sure that your function is called once all the DOM elements of the page are ready to be used.
    
    // Called function to update the name, happiness, and weight of our pet in our HTML
    checkAndUpdatePetInfoInHtml();
  
    // When each button is clicked, it will "call" function for that button (functions are below)
    $('.treat-button').click(clickedTreatButton);
    $('.play-button').click(clickedPlayButton);
    $('.exercise-button').click(clickedExerciseButton);
    $('.reset').click(resetPet);
  
    //when any buton is clicked, save pet_info to local storage
    $('button').click(function() {
      console.log("Saving pet_info to local storage:", pet_info);
      console.log("Saving activity_log to local storage:", activity_log);
      //save activity log as well as pet_info to local storage
      localStorage.setItem('pet_info', JSON.stringify(pet_info));
      localStorage.setItem('activity_log', JSON.stringify(activity_log));
    });
    
    // ready() runs this after the DOM is fully loaded so elements like .activity-list exist
    //when page is loaded, check if pet_info exists in local storage and load it
    $(document).ready(function() {
      var storedPetInfo = localStorage.getItem('pet_info');
      var storedActivityLog = localStorage.getItem('activity_log');
      if (storedPetInfo) {
        pet_info = JSON.parse(storedPetInfo);
        activity_log = JSON.parse(localStorage.getItem('activity_log')) || [];
        $('.activity-list').empty(); // Clear existing activity log in HTML before loading from local storage 
        console.log("Loaded activity_log from local storage:", activity_log);
        for (var i = activity_log.length - 1; i >= 0; i--) {
          // append() adds each saved item to the bottom while we loop newest->oldest
          $('.activity-list').append('<li>' + activity_log[i] + '</li>');
        }
        console.log("Loaded pet_info from local storage:", pet_info);
        console.log("Loaded activity_log from local storage:", activity_log);
        checkAndUpdatePetInfoInHtml();
      }
    });
    
  
    
  })
    function updateActivityLog(action) {
      var currentDateTime = getCurrentDateTime();
      var activityLogEntry = currentDateTime + ': ' + action;
      $('.activity-list').prepend('<li>' + activityLogEntry + '</li>');
      activity_log.push(activityLogEntry); // Add the new log entry to the activity_log array
      console.log("Updated activity_log:", activity_log);
      localStorage.setItem('activity_log', JSON.stringify(activity_log)); // Save the updated activity_log to local storage
    }

    function resetPet() {
      if (confirm("Are you sure you want to reset your pet? This will clear all progress and activity log.")) {
        pet_info = {name:"My Pet Name", weight:0, happiness:0};
        activity_log = [];
        localStorage.removeItem('pet_info');
        localStorage.removeItem('activity_log');
        $('.activity-list').empty();
        checkAndUpdatePetInfoInHtml();
        } else {
          return false;
        }
    }


    //Get Current Date and Time for Logging
    function getCurrentDateTime() {
      var currentDate = new Date();
      var date = currentDate.getDate();
      var month = currentDate.getMonth() + 1; // Months are zero-based
      var year = currentDate.getFullYear();
      var hours = currentDate.getHours();
      var minutes = currentDate.getMinutes();
      var seconds = currentDate.getSeconds();
      
      // Format the date and time as needed (e.g., "MM/DD/YYYY HH:MM:SS")
      return month + '/' + date + '/' + year + ' ' + hours + ':' + minutes + ':' + seconds;
    }
  
    // Add a variable "pet_info" equal to a object with the name (string), weight (number), and happiness (number) of your pet
    var pet_info = {name:"My Pet Name", weight:0, happiness:0};
    var activity_log = [];
  
    function clickedTreatButton() {
      // Increase pet happiness
      //ise is() function to 
      

      pet_info.happiness += 10;
      // Increase pet weight
      pet_info.weight += 5;
      //Update the activity log with the current date and time, and the action taken
      var currentDateTime = getCurrentDateTime();
      var activityLogEntry =': Gave a treat. <happiness>Happiness increased by 10</happiness>, <weight>weight increased by 5</weight>.';
      updateActivityLog(activityLogEntry);
      checkAndUpdatePetInfoInHtml();
    }
    
    function clickedPlayButton() {
      // Increase pet happiness
      pet_info.happiness += 5;
      // Decrease pet weight
      if (pet_info.weight > 0) {
        pet_info.weight -= 2;
        var petImage = $('.pet-image');
        petImage.removeClass('spin');
        void petImage[0].offsetWidth;
        petImage.addClass('spin');
        setTimeout(function() {
          petImage.removeClass('spin');
        }, 1000);

        var activityLogEntry = 'Played with pet. <happiness>Happiness increased by 5</happiness>, <weight>weight decreased by 2</weight>.';
        updateActivityLog(activityLogEntry);

      } else {
        console.warn("Pet weight cannot be negative");
        updateActivityLog(': <error>Tried to play with pet, but weight cannot be negative. No changes made.</error>');
        //make error red
        $('error').css('color', 'red');
        return false;
      }
      checkAndUpdatePetInfoInHtml();
    }
    
    function clickedExerciseButton() {
      // Decrease pet happiness
      // Decrease pet weight
      checkAndUpdatePetInfoInHtml();
      if (pet_info.happiness > 0 && pet_info.weight > 0) {
        pet_info.happiness -= 5;
        pet_info.weight -= 3;
        var currentDateTime = getCurrentDateTime();
        var activityLogEntry =  ': Exercised pet. <happiness>Happiness decreased by 5</happiness>, <weight>weight decreased by 3</weight>.';
        // $('.activity-list').append('<li>' + activityLogEntry + '</li>');
        updateActivityLog(activityLogEntry);
        checkAndUpdatePetInfoInHtml();

      } else {
        console.warn("Pet happiness or weight cannot be negative");
        return false;
      }
    }
  
    function checkAndUpdatePetInfoInHtml() {
      checkWeightAndHappinessBeforeUpdating();  
      updatePetInfoInHtml();
    }
    
    function checkWeightAndHappinessBeforeUpdating() {
      if (pet_info.weight < 0) {
        pet_info.weight = 0;
      }

      if (pet_info.happiness < 0) {
        pet_info.happiness = 0;
      }
    }
    
    // Updates your HTML with the current values in your pet_info object
    function updatePetInfoInHtml() {
      $('.name').text(pet_info['name']);
      $('.weight').text(pet_info['weight']);
      $('.happiness').text(pet_info['happiness']);
    }
  