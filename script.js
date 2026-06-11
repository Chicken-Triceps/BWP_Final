// 달력에서 사용할 HTML 요소를 가져오는 영역
const calendarGrid = document.getElementById("calendarGrid");
const currentMonth = document.getElementById("currentMonth");
const prevMonthButton = document.getElementById("prevMonth");
const nextMonthButton = document.getElementById("nextMonth");
const scheduleTitle = document.getElementById("scheduleTitle");
const scheduleDate = document.getElementById("scheduleDate");
const scheduleCategory = document.getElementById("scheduleCategory");
const scheduleMemo = document.getElementById("scheduleMemo");
const addScheduleBtn = document.getElementById("addScheduleBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const selectedScheduleList = document.getElementById("selectedScheduleList");
const STORAGE_KEY = "studentSchedules";

// 오늘 날짜와 현재 보고 있는 달력 날짜를 저장하는 영역
const today = new Date();
let viewYear = today.getFullYear();
let viewMonth = today.getMonth();
let selectedDate = "";
let editingScheduleId = null;

// 사용자가 추가한 일정을 저장하는 배열 영역
let schedules = [];

function saveSchedules() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
}

function loadSchedules() {
  const savedSchedules = localStorage.getItem(STORAGE_KEY);

  if (!savedSchedules) {
    return;
  }

  try {
    const parsedSchedules = JSON.parse(savedSchedules);
    schedules = Array.isArray(parsedSchedules) ? parsedSchedules : [];
  } catch (error) {
    schedules = [];
    console.error("저장된 일정 데이터를 불러올 수 없습니다.", error);
  }
}

function resetScheduleForm() {
  scheduleTitle.value = "";
  scheduleDate.value = "";
  scheduleCategory.value = "과제";
  scheduleMemo.value = "";
  editingScheduleId = null;
  addScheduleBtn.textContent = "일정 추가";
  cancelEditBtn.hidden = true;
}

// 일정 카테고리 이름을 CSS 클래스 이름으로 바꿔 주는 함수
function getCategoryClass(category) {
  const categoryMap = {
    과제: "assignment",
    시험: "exam",
    발표: "presentation",
    회의: "meeting",
    개인: "personal"
  };

  return categoryMap[category] || "personal";
}

// 연도, 월, 일을 input type="date"와 같은 YYYY-MM-DD 형식으로 만드는 함수
function makeDateString(year, month, date) {
  const monthText = String(month + 1).padStart(2, "0");
  const dateText = String(date).padStart(2, "0");

  return `${year}-${monthText}-${dateText}`;
}

// 현재 보고 있는 연도와 월에 맞춰 달력을 화면에 그리는 함수
function renderCalendar() {
  calendarGrid.innerHTML = "";
  currentMonth.textContent = `${viewYear}년 ${viewMonth + 1}월`;

  // 이번 달 1일의 요일을 구해서 앞쪽 빈칸 개수를 정한다.
  const firstDay = new Date(viewYear, viewMonth, 1);
  const startDay = firstDay.getDay();

  // 다음 달 0일은 이번 달의 마지막 날이므로, 이번 달 날짜 수를 알 수 있다.
  const lastDate = new Date(viewYear, viewMonth + 1, 0).getDate();

  // 1일이 시작되기 전까지 비어 있는 칸을 만든다.
  for (let i = 0; i < startDay; i += 1) {
    const emptyCell = document.createElement("div");
    emptyCell.classList.add("calendar-day", "empty");
    calendarGrid.appendChild(emptyCell);
  }

  // 이번 달의 1일부터 마지막 날짜까지 날짜 칸을 만든다.
  for (let date = 1; date <= lastDate; date += 1) {
    const dayCell = document.createElement("div");
    dayCell.classList.add("calendar-day");

    // 오늘이 포함된 월을 보고 있을 때만 오늘 날짜를 강조한다.
    const isToday =
      viewYear === today.getFullYear() &&
      viewMonth === today.getMonth() &&
      date === today.getDate();

    if (isToday) {
      dayCell.classList.add("today");
    }

    const dayNumber = document.createElement("span");
    dayNumber.classList.add("day-number");
    dayNumber.textContent = date;

    const dotContainer = document.createElement("div");
    dotContainer.classList.add("dot-container");

    // 현재 날짜와 같은 일정을 찾아 dot-container 안에 점으로 표시한다.
    const dateString = makeDateString(viewYear, viewMonth, date);

    if (dateString === selectedDate) {
      dayCell.classList.add("selected");
    }

    const schedulesForDate = schedules.filter(function (schedule) {
      return schedule.date === dateString;
    });

    schedulesForDate.forEach(function (schedule) {
      const dot = document.createElement("span");
      const categoryClass = getCategoryClass(schedule.category);

      dot.classList.add("dot", categoryClass);
      dot.title = schedule.title;
      dotContainer.appendChild(dot);
    });

    dayCell.addEventListener("click", function () {
      selectedDate = dateString;
      renderCalendar();
      renderSelectedDateSchedules();
    });

    dayCell.appendChild(dayNumber);
    dayCell.appendChild(dotContainer);
    calendarGrid.appendChild(dayCell);
  }
}

// 이전 달 버튼을 눌렀을 때 한 달 전으로 이동하는 함수
function goPrevMonth() {
  viewMonth -= 1;

  if (viewMonth < 0) {
    viewMonth = 11;
    viewYear -= 1;
  }

  renderCalendar();
}

// 다음 달 버튼을 눌렀을 때 한 달 뒤로 이동하는 함수
function goNextMonth() {
  viewMonth += 1;

  if (viewMonth > 11) {
    viewMonth = 0;
    viewYear += 1;
  }

  renderCalendar();
}

function renderSelectedDateSchedules() {
  selectedScheduleList.innerHTML = "";

  if (selectedDate === "") {
    const message = document.createElement("p");
    message.classList.add("empty-message");
    message.textContent = "날짜를 선택하세요.";
    selectedScheduleList.appendChild(message);
    return;
  }

  const schedulesForDate = schedules.filter(function (schedule) {
    return schedule.date === selectedDate;
  });

  if (schedulesForDate.length === 0) {
    const message = document.createElement("p");
    message.classList.add("empty-message");
    message.textContent = "등록된 일정이 없습니다.";
    selectedScheduleList.appendChild(message);
    return;
  }

  schedulesForDate.forEach(function (schedule) {
    const scheduleCard = document.createElement("article");
    scheduleCard.classList.add("schedule-card");

    const title = document.createElement("h3");
    title.textContent = schedule.title;

    const categoryBadge = document.createElement("span");
    categoryBadge.classList.add("category-badge", getCategoryClass(schedule.category));
    categoryBadge.textContent = schedule.category;

    const dateText = document.createElement("p");
    dateText.textContent = schedule.date;

    const memoText = document.createElement("p");
    memoText.textContent = schedule.memo === "" ? "메모 없음" : schedule.memo;

    const actions = document.createElement("div");
    actions.classList.add("schedule-actions");

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.classList.add("schedule-action-button", "edit");
    editButton.textContent = "수정";
    editButton.addEventListener("click", function () {
      startEditSchedule(schedule.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.classList.add("schedule-action-button", "delete");
    deleteButton.textContent = "삭제";
    deleteButton.addEventListener("click", function () {
      deleteSchedule(schedule.id);
    });

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);

    scheduleCard.appendChild(title);
    scheduleCard.appendChild(categoryBadge);
    scheduleCard.appendChild(dateText);
    scheduleCard.appendChild(memoText);
    scheduleCard.appendChild(actions);
    selectedScheduleList.appendChild(scheduleCard);
  });
}

function refreshScheduleView() {
  saveSchedules();
  renderCalendar();
  renderSelectedDateSchedules();
}

function deleteSchedule(scheduleId) {
  const shouldDelete = confirm("이 일정을 삭제하시겠습니까?");

  if (!shouldDelete) {
    return;
  }

  schedules = schedules.filter(function (schedule) {
    return schedule.id !== scheduleId;
  });

  if (editingScheduleId === scheduleId) {
    resetScheduleForm();
  }

  refreshScheduleView();
}

function startEditSchedule(scheduleId) {
  const scheduleToEdit = schedules.find(function (schedule) {
    return schedule.id === scheduleId;
  });

  if (!scheduleToEdit) {
    return;
  }

  editingScheduleId = scheduleId;
  scheduleTitle.value = scheduleToEdit.title;
  scheduleDate.value = scheduleToEdit.date;
  scheduleCategory.value = scheduleToEdit.category;
  scheduleMemo.value = scheduleToEdit.memo;
  addScheduleBtn.textContent = "일정 수정";
  cancelEditBtn.hidden = false;
}

function updateSchedule(title, date, category, memo) {
  const scheduleToUpdate = schedules.find(function (schedule) {
    return schedule.id === editingScheduleId;
  });

  if (!scheduleToUpdate) {
    resetScheduleForm();
    return;
  }

  scheduleToUpdate.title = title;
  scheduleToUpdate.date = date;
  scheduleToUpdate.category = category;
  scheduleToUpdate.memo = memo;

  console.log(schedules);
  refreshScheduleView();
  resetScheduleForm();
}

// 입력값을 읽어서 schedules 배열에 새 일정을 추가하는 함수
function addSchedule() {
  const title = scheduleTitle.value.trim();
  const date = scheduleDate.value;
  const category = scheduleCategory.value;
  const memo = scheduleMemo.value.trim();

  // 제목과 날짜는 일정을 구분하는 데 꼭 필요하므로 비어 있으면 알려준다.
  if (title === "" || date === "") {
    alert("일정 제목과 날짜를 입력하세요.");
    return;
  }

  if (editingScheduleId !== null) {
    updateSchedule(title, date, category, memo);
    return;
  }

  const newSchedule = {
    id: Date.now(),
    title: title,
    date: date,
    category: category,
    memo: memo
  };

  schedules.push(newSchedule);
  console.log(schedules);
  refreshScheduleView();
  resetScheduleForm();
}

function cancelEditSchedule() {
  resetScheduleForm();
}


// 버튼 클릭 이벤트를 함수와 연결하는 영역
prevMonthButton.addEventListener("click", goPrevMonth);
nextMonthButton.addEventListener("click", goNextMonth);
addScheduleBtn.addEventListener("click", addSchedule);
cancelEditBtn.addEventListener("click", cancelEditSchedule);

// 페이지가 처음 열릴 때 현재 달력을 한 번 출력한다.
loadSchedules();
renderCalendar();
renderSelectedDateSchedules();
