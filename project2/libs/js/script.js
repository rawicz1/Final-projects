
let departmentsList = []
let locationsList = []
let employeeID = []

$(document).ready(function() {
  
  $('#add-employee-btn').hide()
  $('#add-deprtment-btn').hide()
    getDepartmentsAndLocations()  
    getAllEmployees()
})



//nav bar functions -------------------------------------------------------------------------------------------------------------

$( "#navbar-employees" ).on( "click", function() {
  $("#navbarCollapse").removeClass("show")
  getAllEmployees()
})

$( ".dropdown-item" ).on( "click", function() {  
  $("#navbarCollapse").removeClass("show");
})

$( "#locations-navbar-button" ).on( "click", function() {
  $("#navbarCollapse").removeClass("show")
  getAllLocations()
})

$( "#departaments-navbar-button" ).on( "click", function() {
  $("#navbarCollapse").removeClass("show")   
  getAllDepartments()
})

function getDepartmentsAndLocations() {

  $.ajax({
    url: "libs/php/getDeptsAndLocations.php",
    type: 'GET',
    dataType: 'json',
            
    success: function(result) {  
      departmentsList.length = 0                           
      departmentsList.push(result.departments)
      locationsList.length = 0
      locationsList.push(result.locations)               
    },
    error: function(jqXHR, textStatus, errorThrown) {
        console.log(textStatus, errorThrown)
    }
  }) 
}



// employees -------------------------------------------------------------------------------------------------------

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

          let firstLetterSet = new Set() // to add employees to respective letter 
        
          for (let i=0; i< result.data.length; i++){        
            let currentName = result.data[i].lastName
            let firstChar = currentName[0].toUpperCase()
            firstLetterSet.add(firstChar)         

          }
          
          // show employees 

          let firstLetterArray = Array.from(firstLetterSet)

          for (let i=0; i<firstLetterArray.length; i++){ 
            $('#employees-list-full').append('<li class="list-group-item mt-1 col-lg-8 col-12 border border-dark  mx-auto rounded">'
            + firstLetterArray[i] + '</li>')
            for (let j=0; j<result.data.length; j++){
              if (result.data[j].lastName[0].toUpperCase() === firstLetterArray[i]){
                
                $('#employees-list-full').append('<li class="list-group-item mt-1 col-lg-8 col-12  mx-auto rounded rounded d-flex flex-row justify-content-between">'
                  + '<div class="container"><div class="row">'
                  + '<div class="col-10 col-sm-4 ps-0 m-0">' + result.data[j].lastName + ', '+ result.data[j].firstName  + '</div>'
                  + '<div class="d-none d-sm-block col-sm  pt-1 m-0 d-flex align-items-baseline employee-info">'+ result.data[j].jobTitle + '</div>'
                  + '<div class="d-none d-sm-block col-sm pt-1 m-0 d-flex align-items-end employee-info">'+ result.data[j].department + '</div>'
                  +' <div class="d-none d-sm-block col-sm pt-1 m-0 d-flex align-items-end employee-info">'+ result.data[j].location + '</div></div></div>'            
                  + '<div class="d-flex flex-row justify-content-between"><button type="button" class="btn btn-outline-secondary me-1 btn-sm deleteEmployeeBtn"  data-id="'+ result.data[j].id +'"><i class="bi bi-trash"></i></button>'            
                  + '<button class="btn btn-outline-primary btn-sm " data-bs-toggle="modal" data-bs-target="#employee-modal" data-id="'+ result.data[j].id +'"><i class="bi bi-three-dots"></i></button></div></li>'
                  )
              } 
            }             
          }            
      },

      error: function(jqXHR, textStatus, errorThrown) {
          console.log(textStatus, errorThrown)
      }
  })       
}


// employee modal --------------------------------------------

$('#employee-modal').on('show.bs.modal', function (e) {
  
  $('#department').empty()

  $.ajax({
    url: "libs/php/getPersonnelByID.php",
    type: 'POST',
    dataType: 'json',
    data: {
      id: $(e.relatedTarget).attr('data-id') 
    },

    success: function (result) {
          
    var resultCode = result.status.code

    if (resultCode == 200) {
      
      $('#employeeID').val(result.data.personnel[0].id)
      
      $('#firstName').val(result.data.personnel[0].firstName)
      $('#lastName').val(result.data.personnel[0].lastName)
      $('#jobTitle').val(result.data.personnel[0].jobTitle)
      $('#emailAddress').val(result.data.personnel[0].email)
      
      $('#department').html("");
              
      $.each(result.data.department, function () {
        
        $('#department').append($("<option>", {
          value: this.id,
          text: this.name
        })); 
        
      })
      
      $('#department').val(result.data.personnel[0].departmentID)
      
      } else {

      $('#employee-modal .modal-title').replaceWith("Error retrieving data")

      } 

    },

    error: function (jqXHR, textStatus, errorThrown) {
    $('#employee-modal .modal-title').replaceWith("Error retrieving data")
    }
  })
})


// submit modal form

$('#employee-form').on("submit", function(e) { 
  
  e.preventDefault()
  
  const name = $("#firstName").val()
  console.log(name)
  $('#areYouSureEditLast').html($("#lastName").val())
  $('#areYouSureEditFirst').html($("#firstName").val())
  $('#areYouSureEditEmployeeModal').modal('show') 
  
})


// employee modal confirm edit

$('#confirm-edit-employee').on('click', function(e) {

  e.preventDefault()
  
  $.ajax({
    url: "libs/php/editEmployee.php",
    type: 'POST',
    dataType: 'json',
    data: {
        firstName : $("#firstName").val(), 
        lastName : $("#lastName").val(), 
        jobTitle : $('#jobTitle').val(), 
        email : $("#emailAddress").val(),          
        departmentID : $("#department").val(),
        id: $('#employeeID').val() 
    },
    success: function(result) {
      
      $('#employee-modal').modal('hide')   

      getAllEmployees()     

    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR, textStatus, errorThrown)
    }
  }) 
})



$('#employee-modal').on('shown.bs.modal', function () { 
  
  $('#firstName').focus()
  $('#add-employee-btn').hide()
})



$('#employee-modal').on('hidden.bs.modal', function () {
  
  $('#employee-form')[0].reset()
  $('#add-location-btn').hide()
  $('#add-employee-btn').show()  
})



// delete employee -------------------------------------------

let deleteEmployeeID = []

$(document).on('click','.deleteEmployeeBtn',function(){
  
  deleteEmployeeID.length=0
  deleteEmployeeID.push($(this).attr("data-id"))  

  $.ajax({
    url: "libs/php/getPersonnelByID.php",
    type: 'POST',
    dataType: 'json',
    data: {
      id: $(this).attr("data-id") 
    },

    success: function (result) {   
           
      $('#areYouSureEmployeeLast').text(result.data.person[0].lastName)
      $('#areYouSureEmployeeFirst').text(result.data.person[0].firstName)
    },

    error: function (jqXHR, textStatus, errorThrown) {
      $('#exampleModal .modal-title').replaceWith("Error retrieving data")
    }  
  })
 
  $('#areYouSureDeleteEmployee').modal("show")

})




$('#confirm-delete-employee').on('click', function() {

  $.ajax({
    url: "libs/php/deleteEmployee.php",
    type: 'GET',
    dataType: 'json',
    data: {
        id: deleteEmployeeID[0]     
    },
    success: function(result) {     

        getAllEmployees()
                
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR, textStatus, errorThrown)
    }
  }) 
})



// add employee modal -------------------------------------------------------------------------------------------------------------

$('#add-employee-btn').on('click', function() {
  $('#add-department-select').empty()
  $('#add-department-select').append('<option value="" disabled selected>Select department</option>')
  departmentsList[0].forEach(function(feature) {          
    $('#add-department-select').append('<option value="'+ feature.id +'">'+ feature.name +'</option>')    
  })  

  $('#add-employee-btn').hide() 
  $('#add-employee-modal').modal('show')
})


// submit new employee form

$("#add-employee-form").on('submit', function (e) {
  
  e.preventDefault()
  
  $('#areYouSureAddLast').html($("#addLast").val())
  $('#areYouSureAddFirst').html($("#addName").val())
  $('#areYouSureAddEmployeeModal').modal('show')

})



$('#confirm-add-employee').on('click', function(e) {
  $('#add-employee-modal').modal('hide')
  
  e.preventDefault()
  
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

        getAllEmployees()                
                 
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR, textStatus, errorThrown)
    }
  }) 
})



$('#add-employee-modal').on('shown.bs.modal', function () {   
  
  $('#addName').focus()
  
})



$('#add-employee-modal').on('hidden.bs.modal', function () {
  $('#add-employee-form').trigger("reset")
  $('#add-employee-form')[0].reset()
  $('#add-employee-btn').show()
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
        + '<button class="btn btn-outline-primary btn-sm float-end" data-bs-toggle="modal" data-bs-target="#employee-modal" data-id="'+ result.data[0][i].id +'"><i class="bi bi-three-dots"></i></button></li>')
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR, textStatus, errorThrown)
    }
  }) 
})





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
    + '<span><button class="btn btn-outline-primary btn-sm float-end" data-bs-toggle="modal" data-bs-target="#location-modal" data-id="' + locationsList[0][i]['id'] + ' "><i class="bi bi-three-dots"></i></button>'
    + '<button type="button" class="btn btn-outline-secondary me-1 btn-sm float-end deleteLocationBtn"  data-id="'+ locationsList[0][i]['id'] +'"><i class="bi bi-trash"></i></button>' 
    + '<button class="btn btn-outline-secondary me-1 btn-sm float-end hidden-s employeesInLocationBtn" data-id="'+ locationsList[0][i]['id'] +'"">Employees</button>'
    + '<button class="btn btn-outline-secondary me-1 btn-sm float-end departmentsInLocationBtn" data-id="'+ locationsList[0][i]['id'] +'">Departments</button>'
    + '</span><div/>' 
    + '</li><li class="dept-empty"><div id="'+ (locationsList[0][i]['name']).replace(/\s/g, '') +'"></div></li>')   
      
    $('#' + (locationsList[0][i]['name']).replace(/\s/g, '')).hide()  
  } 
}


// show location modal

$('#location-modal').on('show.bs.modal', function (e) {
 
  $.ajax({
    url: "libs/php/getLocationByID.php",
    type: 'POST',
    dataType: 'json',
    data: {
      id: $(e.relatedTarget).attr('data-id') 
    },
    success: function (result) {
    
    console.log(result)
    var resultCode = result.status.code

    if (resultCode == 200) {
      
      $('#locationID').val(result.data[0]['id'])
      
      $('#editLocation').val(result.data[0]['name'])   
      
    } else {

      $('#location-modal .modal-title').replaceWith("Error retrieving data")

    } 

    },
    error: function (jqXHR, textStatus, errorThrown) {
      $('#location-modal .modal-title').replaceWith("Error retrieving data")
    }
  })
})


// submit edit location form

$('#location-form').on("submit", function(e) { 
  
  e.preventDefault()
  
  $.ajax({
    url: "libs/php/editLocation.php",
    type: 'POST',
    dataType: 'json',
    data: {
        name: $("#editLocation").val(),         
        id: $('#locationID').val() 
    },
    success: function(result) {
      
      $('#location-modal').modal('hide')   

      locationsList.length = 0
      locationsList.push(result.data[0])   
      
      getAllLocations()
      return false 

    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR, textStatus, errorThrown)
    }
  }) 
})



$('#location-modal').on('shown.bs.modal', function () {  
  
  $('#editLocation').focus()
  
})



$('#add-location-btn').on('click', function() {
   
  $('#add-location-btn').hide() 
  $('#add-location-modal').modal('show')

})



// delete location

let deleteLocationID = []

$(document).on('click','.deleteLocationBtn',function(){

  
  deleteLocationID.length=0
  deleteLocationID.push($(this).attr("data-id"))  
   
    $.ajax({
      url: "libs/php/getDepartmentsInLocation.php",
      type: 'POST',
      dataType: 'json',
      data: {
        id: $(this).attr("data-id") 
      },
      success: function (result) {      

        if (result.status.code == 200) {
  
          if (result.data.departmentsCount[0]['COUNT(d.id)'] == 0) {
            
            $("#areYouSureLocationName").text(result.data.departmentsCount[0].location)
  
            $('#areYouSureDeleteLocationModal').modal("show")
            
          } else {
                              
            $("#cantDeleteLocationName").text(result.data.departmentsCount[0].location)
            $("#deptCount").text(result.data.departmentsCount[0]['COUNT(d.id)'])           
            $('#cantDeleteLocationModal').modal("show")                  
          }
          
        } else {
  
          $('#location-modal .modal-title').replaceWith("Error retrieving data")
  
        } 
  
      },
      error: function (jqXHR, textStatus, errorThrown) {
        $('#location-modal .modal-title').replaceWith("Error retrieving data")
      }                               
  })  
})


// confirm delete location modal

$('#confirm-delete-location').on('click', function() {

  $.ajax({
    url: "libs/php/deleteLocation.php",
    type: 'GET',
    dataType: 'json',
    data: {
        id: deleteLocationID[0]     
    },
    success: function(result) {  
     
      locationsList.length = 0
      locationsList.push(result.data[0])   
      
      getAllLocations()
      return false   
                
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR, textStatus, errorThrown)
    }
  }) 
})



// show departments in selected location

$(document).on('click','.departmentsInLocationBtn',function(){

  
  let loID = $(this).attr("data-id")
  const locationSelector = locationsList[0].find(location => location.id == loID)    
  const locationDivId = 'depts' + (locationSelector.name).replace(/\s/g, '')
   
  $('#' + (locationSelector.name).replace(/\s/g, '') ).empty().append('<li><div id="'+ locationDivId +'"></div></li>')
     
  for (let i=0; i < departmentsList[0].length; i++){      
    if (departmentsList[0][i]['locationID'] == loID){       
      $('#' + locationDivId).append('<li class="list-group-item mt-1 col-lg-8 col-12  mx-auto rounded d-flex flex-row justify-content-between">'
      + departmentsList[0][i]['name']     
      + '<button class="btn btn-outline-primary  btn-sm " data-bs-toggle="modal" data-bs-target="#department-modal" data-id="' + departmentsList[0][i].id + '" ><i class="bi bi-three-dots"></i></button>' 
      + '</li>')
    }     
  }    
  $('#' + (locationSelector.name).replace(/\s/g, '') ).toggle()
})
 
 

// show employees in selected location

$(document).on('click','.employeesInLocationBtn',function(){

 console.log($(this).attr("data-id"))
  let loID = $(this).attr("data-id")
  $.ajax({
    url: "libs/php/getEmployeesInLocation.php",
    type: 'POST',
    dataType: 'json',
    data: {     
      id: $(this).attr("data-id"),
    },        
    success: function(result) {           
     
      const locationSelector = locationsList[0].find(location => location.id == loID)      
      const locationDivId = 'employees' + (locationSelector.name).replace(/\s/g, '')
  
      $('#' + (locationSelector.name).replace(/\s/g, '') ).empty().append('<li><div id="'+ locationDivId +'"></div></li>')
       
      for (let i=0; i < result.data.person.length; i++){
       
        $('#' + locationDivId).append('<li class="list-group-item mt-1 col-lg-8 col-12  mx-auto rounded rounded d-flex flex-row justify-content-between">'
        + result.data['person'][i].lastName + ', ' 
        + result.data['person'][i].firstName 
        + '<button class="btn btn-outline-primary btn-sm " data-bs-toggle="modal" data-bs-target="#employee-modal" data-id="'+ result.data['person'][i].id+'"><i class="bi bi-three-dots"></i></button>' 
        + '</li>')
      }
      $('#' + (locationSelector.name).replace(/\s/g, '') ).toggle()           
    },
    error: function(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR, textStatus, errorThrown)
    }
  })       
})


// submit edit location form

$("#edit-location-form").submit(function (e) {
  $('#add-location-btn').hide()
  
  e.preventDefault()

    $.ajax({
      url: "libs/php/editLocation.php",
      type: 'POST',
      dataType: 'json',
      data: {
          name: $("#inputLocation").val(),
          id: parseInt($('#location-modal-title').val())    
      },

      success: function(result) {          
                  
        locationsList.length = 0
        locationsList.push(result.data[0])  
        $('#location-modal').modal('hide')   

        getAllLocations()
        
        return false                   

      },

      error: function(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR, textStatus, errorThrown)
    }
  }) 
})  


// submit add location form

$("#add-location-form").on('submit', function (e) {
  
  e.preventDefault()
  
  $('#areYouSureAddLocation').html($("#addLocation").val())  
  $('#areYouSureAddLocationModal').modal('show')

})


// confirm add location modal

$('#confirm-add-location').on('click', function(e) {
  $('#add-location-modal').modal('hide')
  
  e.preventDefault()
  
  $.ajax({
    url: "libs/php/addLocation.php",
    type: 'POST',
    dataType: 'json',
    data: {
        name : $("#addLocation").val()                
    },

    success: function(result) {       
      
      locationsList.length = 0
      locationsList.push(result.data[0])       
     
      $('#add-location-modal').modal('hide')

      getAllLocations()

      return false 
    
    },

    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR, textStatus, errorThrown)
    }
  }) 
})



$('#add-location-modal').on('shown.bs.modal', function () {   
  
  $('#addLocation').focus()
  
})



$(document).ready(function() {

  $('#add-location-modal, #location-modal').on('hidden.bs.modal', function(){      
    $(this).find('form')[0].reset()
      $('#add-location-btn').show()
      
   })
})





// departments ---------------------------------------------------------------------------------------------------------

function getAllDepartments() {
  
  
  $('#locations-list-full').empty().hide()
  $("#employees-list-full" ).empty().hide()
  $('#departments-list-full').empty()
  $('#add-employee-btn').hide()
  $('#add-location-btn').hide()
  $('#add-department-btn').show()  

    for (let i=0; i<departmentsList[0].length; i++){           

      $('#departments-list-full').append('<li class="list-group-item  mb-1 col-lg-8 col-12 border border-dark  mx-auto rounded"><div class="list-name"><span class="align-middle">'
      + departmentsList[0][i]['name'] + '</span>' 
      + '<span class="align-middle" id="name'+ (departmentsList[0][i]['name']).replace(/\s/g, '') +'" ></span><button class="btn btn-outline-primary btn-sm float-end " data-bs-toggle="modal" data-bs-target="#department-modal" data-id="' + departmentsList[0][i].id + '"><i class="bi bi-three-dots"></i></button>'
      + '<button type="button" class="btn btn-outline-secondary me-1 btn-sm float-end deleteDepartmentBtn"  data-id="'+ departmentsList[0][i].id  +'"><i class="bi bi-trash"></i></button>' 
      +'<button class="btn btn-outline-secondary me-1 btn-sm float-end employeesInDepartmentBtn"  data-id="'+ departmentsList[0][i].id +'" >Employees </button>' +
      '</div></li><li class="dept-empty"><div id="'+ (departmentsList[0][i]['name']).replace(/\s/g, '') +'"></div></li>')
      $('#' + (departmentsList[0][i]['name']).replace(/\s/g, '')).hide()
    }

}


// delete department 

let deleteDepartmentID = []

$(document).on('click','.deleteDepartmentBtn',function(){
  
  deleteDepartmentID.length=0
  deleteDepartmentID.push($(this).attr("data-id"))  
  
    $.ajax({
      url: "libs/php/getEmployeesInDepartment.php",
      type: 'POST',
      dataType: 'json',
      data: {
        id: $(this).attr("data-id") 
      },

      success: function (result) {  
      
        if (result.status.code == 200) {
  
          if (result.data.count[0]['COUNT(p.id)'] == 0) {
            
            $("#areYouSureDepartmentnName").text(result.data.count[0].department)  
            $('#areYouSureDeleteDepartmentModal').modal("show")
            
          } else {
                       
            $("#cantDeleteDepartmentName").text(result.data.count[0].department)
            $("#employeeCount").text(result.data.count[0]['COUNT(p.id)'])      
            $('#cantDeleteDepartmentModal1').modal("show")  

          }
          
        } else {
  
          $('#department-modal .modal-title').replaceWith("Error retrieving data")
  
        } 
  
      },
      error: function (jqXHR, textStatus, errorThrown) {
        $('#department-modal .modal-title').replaceWith("Error retrieving data")
      }                               
  })  
})


// confirm delete department modal

$('#confirm-delete-department').on('click', function() {

  $.ajax({
    url: "libs/php/deleteDepartment.php",
    type: 'GET',
    dataType: 'json',
    data: {
        id: deleteDepartmentID[0]     
    },

    success: function(result) {  
     
      departmentsList.length = 0
      departmentsList.push(result.data[0])   
      
      getAllDepartments()
      return false   
                
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR, textStatus, errorThrown)
    }
  }) 
})


// show department modal

$('#department-modal').on('show.bs.modal', function (e) {
  
  $('#add-department-btn').hide() 
  $('#edit-location-select').empty()  

  locationsList[0].forEach(function(feature){
        $('#edit-location-select').append('<option value="'+ feature.id +'">'+ feature.name +'</option>')
  })   
  
  $.ajax({
    url: "libs/php/getDepartmentByID.php",
    type: 'POST',
    dataType: 'json',
    data: {
      id: $(e.relatedTarget).attr('data-id') 
    },

    success: function (result) {        
      
    if (result.status.code == 200) {
     
      $('#departmentID').val(result.data[0]['id'])      
      $('#editDepartment').val(result.data[0]['name'])   
      $('#edit-location-select').val(result.data[0]['locationID'])

    } else {

      $('#department-modal .modal-title').replaceWith("Error retrieving data")

    } 

    },
    error: function (jqXHR, textStatus, errorThrown) {
      $('#department-modal .modal-title').replaceWith("Error retrieving data")
    }
  })
})


$('#department-modal').on('shown.bs.modal', function () {  
  
  $('#editDepartment').focus()
  
})


// confirm edit changes modal

$('#confirm-edit-department').on('click', function(e) {

  e.preventDefault()
  
  $.ajax({
    url: "libs/php/editDepartment.php",
    type: 'POST',
    dataType: 'json',
    data: {
        name: $('#editDepartment').val(),
        id: $('#departmentID').val(),
        locationID:  $('#edit-location-select').val()
    },
    success: function(result) {
      
      console.log(result)
      departmentsList.length = 0
      departmentsList.push(result.data[0])  
      $('#department-modal').modal('hide')     
      
      getAllDepartments()            
      
      return false    

     },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR, textStatus, errorThrown)
    }
  }) 
})


// submit edit department

$("#edit-department-form").on("submit", function(e) {
  e.preventDefault()
  $('#add-department-btn').hide()
  $('#areYouSureEditDepartment').html($("#editDepartment").val())
  $('#areYouSureEditDepartmentModal').modal('show') 
 
})

 
// add department modal

$('#add-department-btn').on('click', function() {
  $('#add-department-btn').hide() 
  $('#add-location-select').empty()
  $('#add-location-select').append('<option value="" disabled selected>Select department</option>')

  locationsList[0].forEach(function(feature){    
    
    $('#add-location-select').append('<option value="'+ feature.id +'">'+ feature.name +'</option>')

  })   
 
  $('#add-department-modal').modal('show')

})


// submit add department form

$("#add-department-form").on('submit', function (e) {
 
  e.preventDefault()  
  $('#areYouSureAddDepartment').html($("#addDepartment").val())  
  $('#areYouSureAddDepartmentModal').modal('show')

})


// confirm add department modal

$('#confirm-add-department').on('click', function(e) {

  $('#add-location-modal').modal('hide')
  
  e.preventDefault()

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
      return false   

    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR, textStatus, errorThrown)
    }
  })
})


$('#add-department-modal').on('shown.bs.modal', function () {   
  
  $('#addDepartment').focus()
  
})


$(document).on('click','.employeesInDepartmentBtn',function(){
  console.log($(this).attr("data-id"))
  const departmentSelector = departmentsList[0].find(department => department.id == $(this).attr("data-id"))    

  $.ajax({
    url: "libs/php/getEmployeesInDepartment.php",
    type: 'POST',
    dataType: 'json',
    data: {     
      id: $(this).attr("data-id"),
    },        
    success: function(result) {           
     
      $('#' + (departmentSelector.name).replace(/\s/g, '') ).empty()
      
      for (let i=0; i < result.data.employees.length; i++){
       
        $('#' + (departmentSelector.name).replace(/\s/g, '') ).append('<li class="list-group-item mb-1 col-lg-8 col-12  mx-auto rounded rounded d-flex flex-row justify-content-between">'
        + result.data['employees'][i].lastName + ', ' 
        + result.data['employees'][i].firstName 
        + '<button class="btn btn-outline-primary btn-sm " data-bs-toggle="modal" data-bs-target="#employee-modal" data-id="'+ result.data['employees'][i].id +'" ><i class="bi bi-three-dots"></i></button>' 
        + '</li>')
      }
 
        $('#' + (departmentSelector.name).replace(/\s/g, '') ).toggle() 
              
    },
    error: function(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR, textStatus, errorThrown)
    }
  })       
})
 


$(document).ready(function() {
  $('#add-department-modal, #department-modal').on('hidden.bs.modal', function(){
      $(this).find('form')[0].reset()
     
      $('#add-department-btn').show()    
   })
})

