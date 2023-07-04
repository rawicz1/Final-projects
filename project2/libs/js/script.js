
let departmentsList = []
let locationsList = []
let employeeID = []

$(document).ready(function() {
  
  $('#add-employee-btn').hide()
  $('#add-deprtment-btn').hide()
    getDepartmentsAndLocations()  
});


//nav bar functions -------------------------------------------------------------------------------------------------------------

$( "#navbar-employees" ).on( "click", function() {
  $("#navbarCollapse").removeClass("show")
  getAllEmployees()
});

$( ".dropdown-item" ).on( "click", function() {  
  $("#navbarCollapse").removeClass("show");
});

$( "#locations-navbar-button" ).on( "click", function() {
  $("#navbarCollapse").removeClass("show")
  getAllLocations()
});

$( "#departaments-navbar-button" ).on( "click", function() {
  $("#navbarCollapse").removeClass("show")   
  getAllDepartments()
});

function getDepartmentsAndLocations() {

    $.ajax({
      url: "libs/php/getDeptsAndLocations.php",
      type: 'GET',
      dataType: 'json',
             
      success: function(result) {                             
        departmentsList.push(result.departments)
        locationsList.length = 0
        locationsList.push(result.locations)               
      },
      error: function(jqXHR, textStatus, errorThrown) {
          console.log(textStatus, errorThrown)
      }
    }) 
}

// departments ---------------------------------------------------------------------------------------------------------

function getAllDepartments() {

  $('#locations-list-full').empty().hide()
  $("#employees-list-full" ).empty().hide()
  $('#departments-list-full').empty()
  $('#add-employee-btn').hide()
  $('#add-location-btn').hide()
  $('#add-department-btn').show()
    for (let i=0; i<departmentsList[0].length; i++){     

      $('#departments-list-full').append('<li class="list-group-item mt-1 col-lg-8 col-12 border border-dark  mx-auto rounded"><div class="list-name"><span class="align-middle">'
      + departmentsList[0][i]['name'] + '</span><button class="btn btn-outline-primary btn-sm float-end" onclick="departmentModal('+ departmentsList[0][i]['id'] +')"><i class="bi bi-three-dots"></i></button>' +
      '<button class="btn btn-outline-secondary me-1 btn-sm float-end" onclick="showEmployeesInDepartment('+  departmentsList[0][i].id +')">Employees</button>' +
      '</div></li><li class="dept-empty"><div id="'+ (departmentsList[0][i]['name']).replace(/\s/g, '') +'"></div></li>')
      $('#' + (departmentsList[0][i]['name']).replace(/\s/g, '')).hide()
    }

}

//show modal

function departmentModal(id) {
  $('#add-department-btn').hide()
  const departmentSelector = departmentsList[0].find(department => department.id == id) 
  $('#department-modal-title').html(departmentSelector.name).val(id)
  $('#department-modal').modal('show')
}

// send update request

$("#edit-department-form").submit(function (e) {
  $('#add-department-btn').hide()
    $.ajax({
        url: "libs/php/editDepartment.php",
        type: 'POST',
        dataType: 'json',
        data: {
            name: $("#inputDepartment").val(),
            id: parseInt($('#department-modal-title').val())    
        },
        success: function(result) {          
          e.preventDefault()
         
          departmentsList.length = 0
          departmentsList.push(result.data[0])  
          $('#department-modal').modal('hide')     
          
          getAllDepartments()            
                 
  
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.log(jqXHR, textStatus, errorThrown)
      }
  }) 
});


function deleteDepartment() {
  $('#department-alert').empty()

  $.ajax({
    url: "libs/php/getEmployeesInDepartment.php",
    type: 'GET',
    dataType: 'json',
    data: {
        id: parseInt($('#department-modal-title').val())       
    },
    success: function(result) {  
      if (result.data.employees.length > 0){
        $('#department-alert').html("Please make sure there are no employee's records in the database")         

      }
      else {
        
        $.ajax({
          url: "libs/php/deleteDepartment.php",
          type: 'GET',
          dataType: 'json',
          data: {
              id: parseInt($('#department-modal-title').val())       
          },
          success: function(result) {  
            
              $('#department-modal').modal('hide')   
              departmentsList.length = 0
              departmentsList.push(result.data[0])          
              function reload() {
                getAllDepartments()
              }
              setTimeout(reload(), 1000)       
          },
          error: function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR, textStatus, errorThrown)
          }
        })
      }                    
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR, textStatus, errorThrown)
    }
  }) 
}


// show add department modal 

function addDepartmentModal(){

  $('#add-department-btn').hide() 
  locationsList[0].forEach(function(feature){
        $('#add-location-select').append('<option value="'+ feature.id +'">'+ feature.name +'</option>')
  }) 

  $('#add-department-modal').modal('show')
}

// send add department request

$("#add-department-form").submit(function () {
 
  $.ajax({
      url: "libs/php/insertDepartment.php",
      type: 'POST',
      dataType: 'json',
      data: {
          name : $("#addDepartment").val(),
          locationID: $('#add-location-select').val()          
      },
      success: function(result) {      
        
        departmentsList.length = 0
        departmentsList.push(result.data[0])       
       
        $('#add-department-modal').modal('hide') 
          
        getAllDepartments()
         
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR, textStatus, errorThrown)
    }
  }) 
});

$(document).ready(function() {
  $('#add-department-modal, #department-modal').on('hidden.bs.modal', function(){
      $(this).find('form')[0].reset()
      $('#department-alert').empty()
      $('#add-department-btn').show()    
   })
})


function showEmployeesInDepartment(id){  
   
  const departmentSelector = departmentsList[0].find(department => department.id == id)    

  $.ajax({
    url: "libs/php/getEmployeesInDepartment.php",
    type: 'POST',
    dataType: 'json',
    data: {     
      id: id,
    },        
    success: function(result) {           
   
      $('#' + (departmentSelector.name).replace(/\s/g, '') ).empty()
      
      for (let i=0; i < result.data.employees.length; i++){
        
        $('#' + (departmentSelector.name).replace(/\s/g, '') ).append('<li class="list-group-item mt-1 col-lg-8 col-12  mx-auto rounded rounded d-flex flex-row justify-content-between">'
        + result.data['employees'][i].lastName + ', ' 
        + result.data['employees'][i].firstName 
        + '<button class="btn btn-outline-primary btn-sm " onclick="showEmployeeModal('+ result.data['employees'][i].id +')"><i class="bi bi-three-dots"></i></button>' 
        + '</li>')
      }

        $('#' + (departmentSelector.name).replace(/\s/g, '') ).toggle()          
    },
    error: function(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR, textStatus, errorThrown)
    }
  })       
}


// locations ---------------------------------------------------------------------------------------------------------------

function getAllLocations() { 

  $('#locations-list-full').empty()
  $('#locations-list-full').show()
  $( "#employees-list-full" ).empty()
  $('#departments-list-full').empty()
  $('#add-employee-btn').hide()
  $('#add-department-btn').hide()
  $('#add-location-btn').show()
  
  for (let i=0; i<locationsList[0].length; i++){
    
    $('#locations-list-full').append('<li id="'+  +'" data-location-id="'+ locationsList[0][i]['id'] +'"class="list-group-item mt-1 col-lg-8 col-12 border border-dark  mx-auto rounded">' 
    + '<div class="list-name" ><span class="align-middle">'+ locationsList[0][i]['name'] + '</span>'
    + '<span><button class="btn btn-outline-primary btn-sm float-end" onclick="locationModal('+ locationsList[0][i]['id'] +')"><i class="bi bi-three-dots"></i></button>' 
    + '<button class="btn btn-outline-secondary me-1 btn-sm float-end" onclick="showEmployeesInLocation('+  locationsList[0][i].id +')">Employees</button>'
    + '<button class="btn btn-outline-secondary me-1 btn-sm float-end" onclick="showDepartmentsInLocation('+ locationsList[0][i].id +')">Departments</button>'
    + '</span><div/>' 
    + '</li><li class="dept-empty"><div id="'+ (locationsList[0][i]['name']).replace(/\s/g, '') +'"></div></li>')   
      
    $('#' + (locationsList[0][i]['name']).replace(/\s/g, '')).hide()  
  } 
}

// show and hide departments in selected location

function showDepartmentsInLocation(id){  
    console.log('showing departments')
    const locationSelector = locationsList[0].find(location => location.id == id)    
    const locationDivId = 'depts' + (locationSelector.name).replace(/\s/g, '')
    console.log(departmentsList)
    $('#' + (locationSelector.name).replace(/\s/g, '') ).empty().append('<li><div id="'+ locationDivId +'"></div></li>')
     
    for (let i=0; i < departmentsList[0].length; i++){      
      if (departmentsList[0][i]['locationID'] == id){
        // console.log(departmentsList[0][i])
        $('#' + locationDivId).append('<li class="list-group-item mt-1 col-lg-8 col-12  mx-auto rounded d-flex flex-row justify-content-between">'
        + departmentsList[0][i]['name']     
        + '<button class="btn btn-outline-primary  btn-sm " onclick="showEmployeeModal()"><i class="bi bi-three-dots"></i></button>' 
        + '</li>')
      }     
    }    
    $('#' + (locationSelector.name).replace(/\s/g, '') ).toggle("fast")
}

// show employees in selected location

function showEmployeesInLocation(id) {  
  
  $.ajax({
      url: "libs/php/getEmployeesInLocation.php",
      type: 'POST',
      dataType: 'json',
      data: {     
        id: id,
      },        
      success: function(result) {           
        
        const locationSelector = locationsList[0].find(location => location.id == id)      
        const locationDivId = 'employees' + (locationSelector.name).replace(/\s/g, '')
        console.log(locationSelector, locationDivId)
        $('#' + (locationSelector.name).replace(/\s/g, '') ).empty().append('<li><div id="'+ locationDivId +'"></div></li>')
         
        for (let i=0; i < result.data.person.length; i++){
         
          $('#' + locationDivId).append('<li class="list-group-item mt-1 col-lg-8 col-12  mx-auto rounded rounded d-flex flex-row justify-content-between">'
          + result.data['person'][i].lastName + ', ' 
          + result.data['person'][i].firstName 
          + '<button class="btn btn-outline-primary btn-sm " onclick="showEmployeeModal('+ result.data['person'][i].id +')"><i class="bi bi-three-dots"></i></button>' 
          + '</li>')
        }
        $('#' + (locationSelector.name).replace(/\s/g, '') ).toggle()           
      },
      error: function(jqXHR, textStatus, errorThrown) {
          console.log(jqXHR, textStatus, errorThrown)
      }
  })       
}

// show location modal

function locationModal(id) {
  $('#add-location-btn').hide()
  const locationSelector = locationsList[0].find(location => location.id == id) 
  $('#location-modal-title').html(locationSelector.name).val(id)
  $('#location-modal').modal('show')  
}


function deleteLocation() {
  
  $('#location-alert').empty()
  
  $.ajax({
    url: "libs/php/getDepartmentsInLocation.php",
    type: 'GET',
    dataType: 'json',
    data: {
        id: parseInt($('#location-modal-title').val())       
    },
    success: function(result) {  

      if (result.data.departments.length > 0){
        console
        $('#location-alert').html("Please make sure there are no departments records in the location")  
      }
      else {        
        $.ajax({
          url: "libs/php/deleteLocation.php",
          type: 'GET',
          dataType: 'json',
          data: {
              id: parseInt($('#location-modal-title').val())       
          },
          success: function(result) {  
           
              $('#location-modal').modal('hide')   
              locationsList.length = 0
              locationsList.push(result.data[0])          
              function reload() {
                getAllLocations()
              }
              setTimeout(reload(), 1000)       
          },
          error: function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR, textStatus, errorThrown)
          }
        })
      }      
            
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR, textStatus, errorThrown)
    }
  }) 

}


$("#edit-location-form").submit(function (e) {
  $('#add-location-btn').hide()
    $.ajax({
        url: "libs/php/editLocation.php",
        type: 'POST',
        dataType: 'json',
        data: {
            name: $("#inputLocation").val(),
            id: parseInt($('#location-modal-title').val())    
        },
        success: function(result) {          
          e.preventDefault()
         
          locationsList.length = 0
          locationsList.push(result.data[0])  
          $('#location-modal').modal('hide')   
  
          function reload() {
            getAllLocations()
          }
          setTimeout(reload(), 2000)           
  
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.log(jqXHR, textStatus, errorThrown)
      }
    }) 
  });
  


function addLocationModal() {    
  $('#add-location-btn').hide() 
  $('#add-location-modal').modal('show')
}


$("#add-location-form").submit(function (e) {
 
  $.ajax({
      url: "libs/php/addLocation.php",
      type: 'POST',
      dataType: 'json',
      data: {
          name : $("#addLocation").val()                
      },
      success: function(result) {
        e.preventDefault()
        
        locationsList.length = 0
        locationsList.push(result.data[0])       
       
        $('#add-location-modal').modal('hide')
      
        function reload() {
          getAllLocations()
        }
        setTimeout(reload(), 1000)  
      
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR, textStatus, errorThrown)
    }
  }) 
});

$(document).ready(function() {
  $('#add-location-modal, #location-modal').on('hidden.bs.modal', function(){      
    $(this).find('form')[0].reset()
      $('#add-location-btn').show()
      $('#location-alert').empty()
   })
})


function getAllEmployees(){      
  $('#locations-list-full').empty()  
  $('#add-location-btn').hide()
  $('#add-department-btn').hide()
  $('#add-employee-btn').show()
  
  $.ajax({
      url: "libs/php/getAll.php",
      type: 'POST',
      dataType: 'json',
      data: {            
      },        
      success: function(result) {                             
          $('#employees-list-full').empty()
          $('#employees-list-full').show()
          $('#departments-list-full').empty()
          $('#add-employee-btn').show()
          let firstLetterSet = new Set()

          console.log(result)
          for (let i=0; i< result.data.length; i++){        
            let currentName = result.data[i].lastName
            let firstChar = currentName[0].toUpperCase()
            firstLetterSet.add(firstChar)              
          }

          let firstLetterArray = Array.from(firstLetterSet)
        
          for (let i=0; i<firstLetterArray.length; i++){ 
            $('#employees-list-full').append('<li class="list-group-item mt-1 col-lg-8 col-12 border border-dark  mx-auto rounded">'
            + firstLetterArray[i] + '</li>')
            for (let j=0; j<result.data.length; j++){
              if (result.data[j].lastName[0].toUpperCase() === firstLetterArray[i]){
                $('#employees-list-full').append('<li class="list-group-item mt-1 col-lg-8 col-12  mx-auto rounded rounded d-flex flex-row justify-content-between">'
            + result.data[j].lastName + ', ' 
            + result.data[j].firstName 
            + '<button class="btn btn-outline-primary btn-sm " onclick="showEmployeeModal('+ result.data[j].id +')"><i class="bi bi-three-dots"></i></button></li>')
              }               
            }             
          }            
      },
      error: function(jqXHR, textStatus, errorThrown) {
          console.log(textStatus, errorThrown)
      }
  })       
}


// show / edit / delete employee modal --------------------------------------------------------------------------------------------------

function showEmployeeModal(id) {
  employeeID.length = 0
  employeeID.push(id)
 
  $('#add-employee-btn').hide()
  $.ajax({
    url: "libs/php/getPersonnelByID.php",
    type: 'POST',
    dataType: 'json',
    data: {
        id: id
    },        
    success: function(result) {                             
        

      let dept = departmentsList[0].find(d => d.id == result.data.personnel[0].departmentID)
      let locat = locationsList[0].find(l => l.id == dept.locationID)
      $('#location-select').empty().append('<option value="">Select new location</option>')
      $('#department-select').empty().append('<option value="">Select department</option>')
            
      // employee modal card
      $('#employee-name').empty().html(result.data.personnel[0].firstName + ' ' + result.data.personnel[0].lastName)
      $('#employee-department').empty().html(dept.name)
      $('#employee-location').empty().html(locat.name)
      $('#employee-email').empty().html(result.data.personnel[0].email)  
      
      // employee modal form
      $('#form-first-name').empty().html(result.data.personnel[0].firstName)
      $('#form-last-name').empty().html(result.data.personnel[0].lastName)

      if (result.data.personnel[0].jobTitle === "") {        
        $('#form-job').empty().html('<small>No job title provided</small>')
      }
      else{
        $('#form-job').empty().html(result.data.personnel[0].jobTitle)
      }

      $('#form-email').empty().html(result.data.personnel[0].email)
      $('#form-department').empty().html(dept.name).data("data-id", dept.id)
           
      departmentsList[0].forEach(function(feature){
        $('#department-select').append('<option value="'+ feature.id +'">'+ feature.name +'</option>')
      })             
      $('#employee-modal').modal('show')
    },
    error: function(jqXHR, textStatus, errorThrown) {
        console.log(textStatus, errorThrown)
    }
  }) 
}

$("#update-employee-form").submit(function (e) {
$('#add-employee-btn').hide()
  $.ajax({
      url: "libs/php/editEmployee.php",
      type: 'POST',
      dataType: 'json',
      data: {
          firstName : $("#inputName").val() ? $("#inputName").val() : $('#form-first-name').html(), 
          lastName : $("#inputLast").val() ? $("#inputLast").val() : $('#form-last-name').html(),
          jobTitle : $('#inputjob').val() == '' ? '' : $('#inputjob').val(),
          email : $("#inputEmail").val() ? $("#inputEmail").val() : $('#form-email').html(),          
          departmentID : $("#department-select").val() ? parseInt($("#department-select").val()) : parseInt($('#form-department').data("data-id")),
          id: employeeID[0]       
      },
      success: function(result) {
        
        e.preventDefault()     
    
        $('#employee-modal').modal('hide')   

        function reload() {
          getAllEmployees()
        }
        setTimeout(reload(), 2000)           

      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR, textStatus, errorThrown)
    }
  }) 
});



function deleteEmployee() {
  
  $.ajax({
    url: "libs/php/deleteEmployee.php",
    type: 'GET',
    dataType: 'json',
    data: {
        id: parseInt(employeeID[0])       
    },
    success: function(result) {  
     
         $('#employee-modal').modal('hide')   
 
         function reload() {
           getAllEmployees()
         }
         setTimeout(reload(), 1000)       
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR, textStatus, errorThrown)
    }
  }) 
}


// to clear forms after closing the modal

$(document).ready(function() {
  $('#employee-modal').on('hidden.bs.modal', function(){
      $(this).find('form')[0].reset()
      $('#add-location-btn').hide()
      $('#add-employee-btn').show()
   })
})


// add employee modal -------------------------------------------------------------------------------------------------------------

function addEmployeeModal() {
  
  departmentsList[0].forEach(function(feature) {          
    $('#add-department-select').append('<option value="'+ feature.locationID +'">'+ feature.name +'</option>')    
  })  

  $('#add-employee-btn').hide() 
  $('#add-employee-modal').modal('show')
}


$("#add-employee-form").submit(function (e) {

  departmentsList[0].forEach(function(feature) {          
        $('#add-department-select').append('<option value="'+ feature.locationID +'">'+ feature.name +'</option>')        
      })    

  $.ajax({
      url: "libs/php/addEmployee.php",
      type: 'POST',
      dataType: 'json',
      data: {
          firstName : $("#addName").val(), 
          lastName : $("#addLast").val(),
          jobTitle : $("#addJob").val(),
          email : $("#addEmail").val(),
          departmentID : $("#add-department-select").val()         
      },
      success: function(result) {             

        function reload() {
          getAllEmployees()
          $('#add-employee-modal').modal('hide')
        }
        setTimeout(reload(), 1000)            
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR, textStatus, errorThrown)
    }
  }) 
});


$(document).ready(function() {
  $('#add-employee-modal').on('hidden.bs.modal', function(){
      $(this).find('form')[0].reset()
      $('#add-location-select').empty().append('<option value="">Select new location</option>')
      $('#add-employee-btn').show()
     
   })
})





// search employee's name input ----------------------------------------------------------------------------------------------------

$("#employee-search").on('input', function(e){
  
  $('#locations-list-full').empty()
  $( "#employees-list-full" ).empty()
  $( "#departments-list-full" ).empty()
  $.ajax({
    url: "libs/php/searchEmployee.php",
    type: 'POST',
    dataType: 'json',
    data: {
        name: e.target.value     
    },
    success: function(result) {               
      $('#employees-list-full').show()
      for (let i=0; i<result.data[0].length; i++){
        $('#employees-list-full').append('<li class="list-group-item mt-1 col-lg-8 col-12  mx-auto rounded d-flex flex-row justify-content-between">'
        + result.data[0][i].lastName + ', ' 
        + result.data[0][i].firstName 
        + '<button class="btn btn-outline-primary btn-sm float-end" onclick="showEmployeeModal('+ result.data[0][i].id +')"><i class="bi bi-three-dots"></i></button></li>')
      }

    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR, textStatus, errorThrown)
  }
}) 
});