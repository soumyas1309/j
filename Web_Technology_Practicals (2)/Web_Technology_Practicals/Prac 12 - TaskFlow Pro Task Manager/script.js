$(document).ready(function () {
  let tasks = [];
  try {
    tasks = JSON.parse(localStorage.getItem("taskflow_tasks")) || [];
    if (!Array.isArray(tasks)) tasks = [];
  } catch (error) {
    tasks = [];
  }

  let currentFilter = "all";
  let editingId = null;

  function todayString() {
    let date = new Date();
    return date.getFullYear() + "-" +
      String(date.getMonth() + 1).padStart(2, "0") + "-" +
      String(date.getDate()).padStart(2, "0");
  }

  $("#currentDate").text(new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  }));

  $("#dueDate").attr("min", todayString());

  function saveTasks() {
    try {
      localStorage.setItem("taskflow_tasks", JSON.stringify(tasks));
      return true;
    } catch (error) {
      alert("Unable to save tasks. Check browser storage.");
      return false;
    }
  }

  function isOverdue(task) {
    return task.dueDate && task.dueDate < todayString() && !task.completed;
  }

  function updateStats() {
    let total = tasks.length;
    let completed = tasks.filter(task => task.completed).length;
    let pending = total - completed;
    let overdue = tasks.filter(isOverdue).length;
    let percent = total ? Math.round(completed / total * 100) : 0;

    $("#total").text(total);
    $("#completed").text(completed);
    $("#pending").text(pending);
    $("#overdue").text(overdue);
    $("#progressText").text(percent + "% completed");
    $("#progressCount").text(completed + " of " + total + " tasks");
    $("#progressBar").css("width", percent + "%");
  }

  function formatDate(date) {
    if (!date) return "No due date";
    return new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }

  function renderTasks() {
    let search = $("#searchInput").val().trim().toLowerCase();
    let filteredTasks = tasks.filter(function (task) {
      let matchesFilter = currentFilter === "all" ||
        (currentFilter === "pending" && !task.completed) ||
        (currentFilter === "completed" && task.completed);
      return matchesFilter && task.title.toLowerCase().includes(search);
    });

    $("#taskList").empty();
    $("#emptyState").prop("hidden", filteredTasks.length !== 0);

    if (filteredTasks.length === 0) {
      if (search) {
        $("#emptyTitle").text("No matching tasks");
        $("#emptyMessage").text("Try a different search term.");
      } else if (currentFilter === "completed") {
        $("#emptyTitle").text("Nothing completed yet");
        $("#emptyMessage").text("Completed tasks will appear here.");
      } else if (currentFilter === "pending") {
        $("#emptyTitle").text("All caught up!");
        $("#emptyMessage").text("You have no pending tasks.");
      } else {
        $("#emptyTitle").text("Your workspace is clear");
        $("#emptyMessage").text("Add your first task and get started.");
      }
    }

    filteredTasks.forEach(function (task) {
      let item = $("<div>").addClass("task-item");
      if (task.completed) item.addClass("done");
      if (isOverdue(task)) item.addClass("overdue");

      let checkbox = $("<input>")
        .attr("type", "checkbox")
        .attr("aria-label", "Mark task completed")
        .addClass("task-check")
        .prop("checked", task.completed)
        .on("change", function () {
          task.completed = this.checked;
          saveTasks();
          renderTasks();
          updateStats();
        });

      let details = $("<div>").addClass("task-details");

      $("<div>")
        .addClass("task-name")
        .text(task.title)
        .appendTo(details);

      let meta = $("<div>").addClass("task-meta");

      $("<span>")
        .addClass("priority " + task.priority)
        .text(task.priority)
        .appendTo(meta);

      let dueText = task.dueDate ? "Due " + formatDate(task.dueDate) : "No due date";
      if (isOverdue(task)) dueText += " · Overdue";

      $("<span>")
        .addClass("task-time")
        .text(dueText)
        .appendTo(meta);

      details.append(meta);

      let actions = $("<div>").addClass("task-actions");

      $("<button>")
        .addClass("action-btn")
        .text("Edit")
        .on("click", function () {
          editingId = task.id;
          $("#taskInput").val(task.title);
          $("#priority").val(task.priority);
          $("#dueDate").val(task.dueDate || "");
          $("#submitButton").text("Save Changes");
          $("#cancelEdit").prop("hidden", false);
          $("#taskInput").focus();
          $("html, body").animate({ scrollTop: $("#taskForm").offset().top - 20 }, 300);
        })
        .appendTo(actions);

      $("<button>")
        .addClass("action-btn delete-btn")
        .text("Delete")
        .on("click", function () {
          tasks = tasks.filter(t => t.id !== task.id);
          saveTasks();
          renderTasks();
          updateStats();
        })
        .appendTo(actions);

      item.append(checkbox, details, actions);
      $("#taskList").append(item);
    });

    updateStats();
  }

  $("#taskForm").on("submit", function (event) {
    event.preventDefault();
    let title = $("#taskInput").val().trim();
    let priority = $("#priority").val();
    let dueDate = $("#dueDate").val();

    if (!title) return;

    if (editingId) {
      let task = tasks.find(t => t.id === editingId);
      if (task) {
        task.title = title;
        task.priority = priority;
        task.dueDate = dueDate;
      }
      editingId = null;
      $("#submitButton").text("＋ Add Task");
      $("#cancelEdit").prop("hidden", true);
    } else {
      tasks.push({
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        title: title,
        priority: priority,
        dueDate: dueDate,
        completed: false
      });
    }

    saveTasks();
    renderTasks();
    this.reset();
    $("#dueDate").attr("min", todayString());
  });

  $("#cancelEdit").on("click", function () {
    editingId = null;
    $("#taskForm")[0].reset();
    $("#submitButton").text("＋ Add Task");
    $(this).prop("hidden", true);
  });

  $(".filter").on("click", function () {
    $(".filter").removeClass("active");
    $(this).addClass("active");
    currentFilter = $(this).data("filter");
    renderTasks();
  });

  $(".side-link").on("click", function () {
    $(".side-link").removeClass("active");
    $(this).addClass("active");
    currentFilter = $(this).data("filter");
    $(".filter[data-filter='" + currentFilter + "']").click();
  });

  $("#searchInput").on("input", function () {
    renderTasks();
  });

  $("#clearCompleted").on("click", function () {
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    renderTasks();
  });

  $("#loadSample").on("click", function () {
    let btn = $(this);
    let status = $("#ajaxStatus");
    btn.prop("disabled", true).text("Loading...");
    status.text("");

    $.ajax({
      url: "https://jsonplaceholder.typicode.com/todos/" + Math.ceil(Math.random() * 20),
      method: "GET",
      success: function (data) {
        tasks.push({
          id: Date.now().toString() + Math.random().toString(16).slice(2),
          title: data.title.charAt(0).toUpperCase() + data.title.slice(1),
          priority: "Medium",
          dueDate: "",
          completed: data.completed
        });
        saveTasks();
        renderTasks();
        status.text("✓ Sample task loaded successfully!");
      },
      error: function () {
        status.text("✗ Failed to load sample task. Check your connection.");
      },
      complete: function () {
        btn.prop("disabled", false).text("Load Sample Task ↗");
      }
    });
  });

  renderTasks();
});
