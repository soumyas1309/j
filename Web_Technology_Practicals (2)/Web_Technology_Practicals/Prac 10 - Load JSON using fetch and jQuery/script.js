function loadStudents() {
  fetch("students.json")
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      var tbody = document.getElementById("tableBody");
      tbody.innerHTML = "";
      data.forEach(function(student) {
        var row = "<tr>" +
          "<td>" + student.id + "</td>" +
          "<td>" + student.name + "</td>" +
          "<td>" + student.department + "</td>" +
          "<td>" + student.marks + "</td>" +
          "</tr>";
        tbody.innerHTML += row;
      });
    })
    .catch(function(error) {
      alert("Failed to fetch: " + error.message);
    });
}

$("#jqLoadBtn").click(function() {
  $.getJSON("students.json", function(data) {
    $("#jqTableBody").empty();
    $.each(data, function(index, student) {
      $("#jqTableBody").append(`
        <tr>
          <td>${student.id}</td>
          <td>${student.name}</td>
          <td>${student.department}</td>
          <td>${student.marks}</td>
        </tr>
      `);
    });
  }).fail(function() {
    alert("Error loading JSON data.");
  });
});
