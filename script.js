// 달력에서 사용할 HTML 요소를 가져오는 영역
const calendarGrid = document.getElementById("calendarGrid");
const currentMonth = document.getElementById("currentMonth");
const prevMonthButton = document.getElementById("prevMonth");
const nextMonthButton = document.getElementById("nextMonth");
const scheduleTitle = document.getElementById("scheduleTitle");
const scheduleDate = document.getElementById("scheduleDate");
const toggleScheduleTimeBtn = document.getElementById("toggleScheduleTimeBtn");
const scheduleTimePanel = document.getElementById("scheduleTimePanel");
const scheduleStartDate = document.getElementById("scheduleStartDate");
const scheduleStartTime = document.getElementById("scheduleStartTime");
const scheduleEndDate = document.getElementById("scheduleEndDate");
const scheduleEndTime = document.getElementById("scheduleEndTime");
const scheduleCategory = document.getElementById("scheduleCategory");
const scheduleMemo = document.getElementById("scheduleMemo");
const addScheduleBtn = document.getElementById("addScheduleBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const selectedScheduleList = document.getElementById("selectedScheduleList");
const categoryFilterList = document.getElementById("categoryFilterList");
const selectAllCategoriesBtn = document.getElementById("selectAllCategoriesBtn");
const clearAllCategoriesBtn = document.getElementById("clearAllCategoriesBtn");
const categoryName = document.getElementById("categoryName");
const categoryColor = document.getElementById("categoryColor");
const saveCategoryBtn = document.getElementById("saveCategoryBtn");
const cancelCategoryEditBtn = document.getElementById("cancelCategoryEditBtn");
const toggleCategoryPanelBtn = document.getElementById("toggleCategoryPanelBtn");
const categoryPanelBody = document.getElementById("categoryPanelBody");
const categoryList = document.getElementById("categoryList");
const termLabel = document.getElementById("termLabel");
const openTermSettingsBtn = document.getElementById("openTermSettingsBtn");
const termSettingsPanel = document.getElementById("termSettingsPanel");
const gradeSelect = document.getElementById("gradeSelect");
const termSelect = document.getElementById("termSelect");
const termStartDate = document.getElementById("termStartDate");
const termEndDate = document.getElementById("termEndDate");
const saveTermSettingsBtn = document.getElementById("saveTermSettingsBtn");
const subjectName = document.getElementById("subjectName");
const professorName = document.getElementById("professorName");
const classroom = document.getElementById("classroom");
const subjectDayCheckboxes = document.querySelectorAll('input[name="subjectDays"]');
const subjectDayStartInputs = document.querySelectorAll(".subject-day-start");
const subjectDayEndInputs = document.querySelectorAll(".subject-day-end");
const saveSubjectBtn = document.getElementById("saveSubjectBtn");
const cancelSubjectEditBtn = document.getElementById("cancelSubjectEditBtn");
const openSubjectFormBtn = document.getElementById("openSubjectFormBtn");
const closeSubjectFormBtn = document.getElementById("closeSubjectFormBtn");
const deleteSubjectBtn = document.getElementById("deleteSubjectBtn");
const subjectFormPanel = document.getElementById("subjectFormPanel");
const subjectFormTitle = document.getElementById("subjectFormTitle");
const timetableGrid = document.getElementById("timetableGrid");
const subjectHoverCard = document.getElementById("subjectHoverCard");
const subjectActionPopover = document.getElementById("subjectActionPopover");
const popoverEditSubjectBtn = document.getElementById("popoverEditSubjectBtn");
const popoverDeleteSubjectBtn = document.getElementById("popoverDeleteSubjectBtn");
const STORAGE_KEY = "studentSchedules";
const CATEGORY_STORAGE_KEY = "scheduleCategories";
const TERM_STORAGE_KEY = "termSettings";
const SUBJECT_STORAGE_PREFIX = "subjects";

// 오늘 날짜와 현재 보고 있는 달력 날짜를 저장하는 영역
const today = new Date();
let viewYear = today.getFullYear();
let viewMonth = today.getMonth();
let selectedDate = "";
let editingScheduleId = null;
let editingSubjectId = null;
let editingCategoryId = null;
let activeSubjectId = null;
let activeSubjectAnchor = null;

// 사용자가 추가한 일정을 저장하는 배열 영역
let schedules = [];
let subjects = [];
let categories = [];
let selectedCategoryIds = [];
let termSettings = {
  grade: "1",
  term: "1",
  startDate: "",
  endDate: ""
};

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

function getDefaultCategories() {
  return [
    { id: "assignment", name: "과제", color: "#2563eb", protected: true },
    { id: "exam", name: "시험", color: "#dc2626", protected: true },
    { id: "presentation", name: "발표", color: "#7c3aed", protected: true },
    { id: "meeting", name: "회의", color: "#f97316", protected: true },
    { id: "personal", name: "개인", color: "#16a34a", protected: true },
    { id: "class", name: "수업", color: "#0f766e", protected: true }
  ];
}

function normalizeCategories(categoryList) {
  const defaultCategories = getDefaultCategories();
  const normalizedCategories = Array.isArray(categoryList) ? categoryList.slice() : [];

  defaultCategories.forEach(function (defaultCategory) {
    const savedCategory = normalizedCategories.find(function (category) {
      return category.id === defaultCategory.id || category.name === defaultCategory.name;
    });

    if (savedCategory) {
      savedCategory.id = defaultCategory.id;
      savedCategory.name = defaultCategory.name;
      savedCategory.protected = true;
      savedCategory.color = savedCategory.color || defaultCategory.color;
      return;
    }

    normalizedCategories.push(defaultCategory);
  });

  return normalizedCategories;
}

function saveCategories() {
  localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
}

function loadCategories() {
  const savedCategories = localStorage.getItem(CATEGORY_STORAGE_KEY);

  if (!savedCategories) {
    categories = normalizeCategories([]);
    saveCategories();
    return;
  }

  try {
    const parsedCategories = JSON.parse(savedCategories);
    categories = normalizeCategories(
      Array.isArray(parsedCategories) && parsedCategories.length > 0
      ? parsedCategories
      : []
    );
    saveCategories();
  } catch (error) {
    categories = normalizeCategories([]);
    console.error("저장된 카테고리를 불러올 수 없습니다.", error);
  }
}

function selectEveryCategory() {
  selectedCategoryIds = categories.map(function (category) {
    return category.id;
  });
}

function isCategorySelected(categoryId) {
  return selectedCategoryIds.includes(categoryId);
}

function getCategoryInfo(categoryValue) {
  return categories.find(function (category) {
    return category.id === categoryValue || category.name === categoryValue;
  }) || {
    id: categoryValue,
    name: categoryValue || "카테고리 없음",
    color: "#64748b"
  };
}

function renderCategoryOptions(selectedValue) {
  scheduleCategory.innerHTML = "";

  categories.forEach(function (category) {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    scheduleCategory.appendChild(option);
  });

  if (selectedValue) {
    const categoryInfo = getCategoryInfo(selectedValue);
    scheduleCategory.value = categoryInfo.id;
  }
}

function resetCategoryForm() {
  categoryName.value = "";
  categoryName.readOnly = false;
  categoryColor.value = "#64748b";
  editingCategoryId = null;
  saveCategoryBtn.textContent = "카테고리 저장";
  cancelCategoryEditBtn.hidden = true;
}

function renderCategoryFilters() {
  categoryFilterList.innerHTML = "";

  categories.forEach(function (category) {
    const label = document.createElement("label");
    label.classList.add("category-filter-item");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = category.id;
    checkbox.checked = isCategorySelected(category.id);
    checkbox.addEventListener("change", function () {
      if (checkbox.checked) {
        selectedCategoryIds.push(category.id);
      } else {
        selectedCategoryIds = selectedCategoryIds.filter(function (selectedId) {
          return selectedId !== category.id;
        });
      }

      renderCalendar();
      renderSelectedDateSchedules();
    });

    const swatch = document.createElement("span");
    swatch.classList.add("category-filter-swatch");
    swatch.style.backgroundColor = category.color;

    const name = document.createElement("span");
    name.textContent = category.name;

    label.appendChild(checkbox);
    label.appendChild(swatch);
    label.appendChild(name);
    categoryFilterList.appendChild(label);
  });
}

function selectAllCategories() {
  selectEveryCategory();
  renderCategoryFilters();
  renderCalendar();
  renderSelectedDateSchedules();
}

function clearAllCategories() {
  selectedCategoryIds = [];
  renderCategoryFilters();
  renderCalendar();
  renderSelectedDateSchedules();
}

function saveTermSettings() {
  localStorage.setItem(TERM_STORAGE_KEY, JSON.stringify(termSettings));
}

function loadTermSettings() {
  const savedSettings = localStorage.getItem(TERM_STORAGE_KEY);

  if (!savedSettings) {
    renderTermLabel();
    return;
  }

  try {
    const parsedSettings = JSON.parse(savedSettings);

    if (parsedSettings && parsedSettings.grade && parsedSettings.term) {
      termSettings = {
        grade: parsedSettings.grade,
        term: parsedSettings.term,
        startDate: parsedSettings.startDate || "",
        endDate: parsedSettings.endDate || ""
      };

      gradeSelect.value = termSettings.grade;
      termSelect.value = termSettings.term;
      termStartDate.value = termSettings.startDate;
      termEndDate.value = termSettings.endDate;
    }
  } catch (error) {
    termSettings = {
      grade: "1",
      term: "1",
      startDate: "",
      endDate: ""
    };
    console.error("저장된 학년 학기 설정을 불러올 수 없습니다.", error);
  }

  renderTermLabel();
}

function getSubjectStorageKey() {
  return `${SUBJECT_STORAGE_PREFIX}:${termSettings.grade}:${termSettings.term}`;
}

function saveSubjects() {
  localStorage.setItem(getSubjectStorageKey(), JSON.stringify(subjects));
}

function loadSubjects() {
  let savedSubjects = localStorage.getItem(getSubjectStorageKey());
  let shouldSaveMigratedSubjects = false;

  if (!savedSubjects) {
    const legacySubjects = localStorage.getItem(SUBJECT_STORAGE_PREFIX);

    if (legacySubjects) {
      savedSubjects = legacySubjects;
      shouldSaveMigratedSubjects = true;
      localStorage.removeItem(SUBJECT_STORAGE_PREFIX);
    }
  }

  if (!savedSubjects) {
    subjects = [];
    return;
  }

  try {
    const parsedSubjects = JSON.parse(savedSubjects);

    subjects = Array.isArray(parsedSubjects)
      ? parsedSubjects.map(function (subject) {
          if (Array.isArray(subject.classTimes)) {
            return subject;
          }

          shouldSaveMigratedSubjects = true;

          const migratedDays = Array.isArray(subject.days)
            ? subject.days
            : subject.day
              ? [subject.day]
              : [];

          return {
            id: subject.id,
            name: subject.name,
            professor: subject.professor,
            room: subject.room,
            days: migratedDays,
            classTimes: migratedDays.map(function (day) {
              return {
                day: day,
                startTime: subject.startTime,
                endTime: subject.endTime
              };
            })
          };
        })
      : [];

    if (shouldSaveMigratedSubjects) {
      saveSubjects();
    }
  } catch (error) {
    subjects = [];
    console.error("저장된 과목 데이터를 불러올 수 없습니다.", error);
  }
}

function resetScheduleForm() {
  scheduleTitle.value = "";
  editingScheduleId = null;
  syncScheduleDateDefault();
  hideScheduleTimePanel();
  scheduleCategory.value = categories[0] ? categories[0].id : "";
  scheduleMemo.value = "";
  addScheduleBtn.textContent = "일정 추가";
  cancelEditBtn.hidden = true;
}

function resetSubjectForm() {
  subjectName.value = "";
  professorName.value = "";
  classroom.value = "";
  clearSubjectClassTimes();
  editingSubjectId = null;
  saveSubjectBtn.textContent = "과목 추가";
  subjectFormTitle.textContent = "과목 추가";
  cancelSubjectEditBtn.hidden = true;
  deleteSubjectBtn.hidden = true;
  subjectFormPanel.hidden = true;
  subjectFormPanel.classList.remove("edit-floating");
  activeSubjectId = null;
  activeSubjectAnchor = null;
  hideSubjectActionPopover();
  syncClassTimeInputState();
}

function openSubjectForm() {
  resetSubjectForm();
  subjectFormPanel.classList.remove("edit-floating");
  subjectFormPanel.hidden = false;
}

function closeSubjectForm() {
  resetSubjectForm();
}

function getCardRelativePosition(anchorElement, width, height, preferredPlacement = "right") {
  const cardRect = document.getElementById("subjectPanel").getBoundingClientRect();
  const anchorRect = anchorElement.getBoundingClientRect();
  const anchorLeft = anchorRect.left - cardRect.left;
  const anchorTop = anchorRect.top - cardRect.top;
  const anchorRight = anchorLeft + anchorRect.width;
  const anchorBottom = anchorTop + anchorRect.height;
  const maxLeft = cardRect.width - width - 12;
  const maxTop = cardRect.height - height - 12;

  let rawLeft = anchorRight + 8;
  let rawTop = anchorTop;

  if (preferredPlacement === "below") {
    rawLeft = anchorLeft;
    rawTop = anchorBottom + 8;

    if (rawTop > maxTop) {
      rawTop = anchorTop - height - 8;
    }

    if (rawTop < 12) {
      rawLeft = anchorRight + 8;
      rawTop = anchorTop;
    }
  }

  if (rawLeft > maxLeft) {
    rawLeft = anchorLeft - width - 8;
  }

  return {
    left: Math.max(12, Math.min(rawLeft, maxLeft)),
    top: Math.max(12, Math.min(rawTop, maxTop))
  };
}

function showSubjectHoverCard(subject, classTime, anchorElement) {
  if (!subjectActionPopover.hidden) {
    return;
  }

  const position = getCardRelativePosition(anchorElement, 220, 120, "below");
  subjectHoverCard.innerHTML = "";

  const title = document.createElement("h3");
  title.textContent = subject.name;

  const timeText = document.createElement("p");
  timeText.textContent = `${classTime.day} ${classTime.startTime} ~ ${classTime.endTime}`;

  const professorText = document.createElement("p");
  professorText.textContent = `교수명: ${subject.professor || "-"}`;

  const roomText = document.createElement("p");
  roomText.textContent = `강의실: ${subject.room || "-"}`;

  subjectHoverCard.appendChild(title);
  subjectHoverCard.appendChild(timeText);
  subjectHoverCard.appendChild(professorText);
  subjectHoverCard.appendChild(roomText);
  subjectHoverCard.style.left = `${position.left}px`;
  subjectHoverCard.style.top = `${position.top}px`;
  subjectHoverCard.hidden = false;
}

function hideSubjectHoverCard() {
  subjectHoverCard.hidden = true;
}

function showSubjectActionPopover(subjectId, anchorElement) {
  activeSubjectId = subjectId;
  activeSubjectAnchor = anchorElement;
  hideSubjectHoverCard();

  const position = getCardRelativePosition(anchorElement, 160, 44);
  subjectActionPopover.style.left = `${position.left}px`;
  subjectActionPopover.style.top = `${position.top}px`;
  subjectActionPopover.hidden = false;
}

function hideSubjectActionPopover() {
  subjectActionPopover.hidden = true;
}

function positionSubjectEditPanel(anchorElement) {
  const position = getCardRelativePosition(anchorElement, 360, 420);
  subjectFormPanel.style.left = `${position.left}px`;
  subjectFormPanel.style.top = `${position.top}px`;
}

function syncClassTimeInputState() {
  subjectDayCheckboxes.forEach(function (checkbox) {
    const day = checkbox.value;
    const startInput = document.querySelector(`.subject-day-start[data-day="${day}"]`);
    const endInput = document.querySelector(`.subject-day-end[data-day="${day}"]`);

    startInput.disabled = !checkbox.checked;
    endInput.disabled = !checkbox.checked;

    if (!checkbox.checked) {
      startInput.value = "";
      endInput.value = "";
    }
  });
}

function getTimeMinutes(time) {
  const parts = time.split(":");

  return Number(parts[0]) * 60 + Number(parts[1]);
}

function getTimeFromMinutes(totalMinutes) {
  const normalizedMinutes = Math.min(totalMinutes, 23 * 60 + 55);
  const hour = Math.floor(normalizedMinutes / 60);
  const minute = normalizedMinutes % 60;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function roundTimeToFiveMinutes(time) {
  if (time === "") {
    return "";
  }

  const roundedMinutes = Math.round(getTimeMinutes(time) / 5) * 5;

  return getTimeFromMinutes(roundedMinutes);
}

function getEndTimeDefault(startTime) {
  return getTimeFromMinutes(getTimeMinutes(startTime) + 60);
}

function handleSubjectStartTimeChange(event) {
  const startInput = event.target;
  const day = startInput.dataset.day;
  const endInput = document.querySelector(`.subject-day-end[data-day="${day}"]`);

  startInput.value = roundTimeToFiveMinutes(startInput.value);

  if (startInput.value === "") {
    endInput.value = "";
    return;
  }

  if (endInput.value === "" || endInput.value <= startInput.value) {
    endInput.value = getEndTimeDefault(startInput.value);
  }
}

function handleSubjectEndTimeChange(event) {
  const endInput = event.target;
  const day = endInput.dataset.day;
  const startInput = document.querySelector(`.subject-day-start[data-day="${day}"]`);

  endInput.value = roundTimeToFiveMinutes(endInput.value);

  if (startInput.value !== "" && endInput.value !== "" && endInput.value <= startInput.value) {
    alert("시작 시간은 종료 시간보다 빨라야 합니다.");
    endInput.value = getEndTimeDefault(startInput.value);
  }
}

function getSubjectClassTimes() {
  return Array.from(subjectDayCheckboxes)
    .filter(function (checkbox) {
      return checkbox.checked;
    })
    .map(function (checkbox) {
      const day = checkbox.value;
      const startInput = document.querySelector(`.subject-day-start[data-day="${day}"]`);
      const endInput = document.querySelector(`.subject-day-end[data-day="${day}"]`);

      return {
        day: day,
        startTime: startInput.value,
        endTime: endInput.value
      };
    });
}

function clearSubjectClassTimes() {
  subjectDayCheckboxes.forEach(function (checkbox) {
    checkbox.checked = false;
  });

  subjectDayStartInputs.forEach(function (input) {
    input.value = "";
  });

  subjectDayEndInputs.forEach(function (input) {
    input.value = "";
  });
}

function setSubjectClassTimes(classTimes) {
  clearSubjectClassTimes();

  subjectDayCheckboxes.forEach(function (checkbox) {
    const classTime = classTimes.find(function (item) {
      return item.day === checkbox.value;
    });

    if (classTime) {
      const startInput = document.querySelector(`.subject-day-start[data-day="${classTime.day}"]`);
      const endInput = document.querySelector(`.subject-day-end[data-day="${classTime.day}"]`);

      checkbox.checked = true;
      startInput.value = classTime.startTime;
      endInput.value = classTime.endTime;
    }
  });

  syncClassTimeInputState();
}

// 연도, 월, 일을 input type="date"와 같은 YYYY-MM-DD 형식으로 만드는 함수
function makeDateString(year, month, date) {
  const monthText = String(month + 1).padStart(2, "0");
  const dateText = String(date).padStart(2, "0");

  return `${year}-${monthText}-${dateText}`;
}

function getDefaultScheduleDate() {
  return selectedDate || makeDateString(today.getFullYear(), today.getMonth(), today.getDate());
}

function syncScheduleDateDefault() {
  if (editingScheduleId !== null) {
    return;
  }

  scheduleDate.value = getDefaultScheduleDate();
}

function showScheduleTimePanel() {
  const baseDate = scheduleDate.value || getDefaultScheduleDate();

  scheduleTimePanel.hidden = false;
  toggleScheduleTimeBtn.textContent = "시간 설정 닫기";
  toggleScheduleTimeBtn.setAttribute("aria-expanded", "true");

  scheduleStartDate.value = baseDate;
  scheduleEndDate.value = baseDate;
  scheduleStartTime.value = "09:00";
  scheduleEndTime.value = "10:00";
}

function hideScheduleTimePanel() {
  scheduleTimePanel.hidden = true;
  toggleScheduleTimeBtn.textContent = "시간 설정";
  toggleScheduleTimeBtn.setAttribute("aria-expanded", "false");
  scheduleStartDate.value = "";
  scheduleStartTime.value = "";
  scheduleEndDate.value = "";
  scheduleEndTime.value = "";
}

function toggleScheduleTimePanel() {
  if (scheduleTimePanel.hidden) {
    showScheduleTimePanel();
    return;
  }

  hideScheduleTimePanel();
}

function handleScheduleDateChange() {
  if (!isScheduleTimeEnabled() || editingScheduleId !== null) {
    return;
  }

  scheduleStartDate.value = scheduleDate.value;
  scheduleEndDate.value = scheduleDate.value;
}

function isScheduleTimeEnabled() {
  return !scheduleTimePanel.hidden;
}

function getScheduleStartDate(schedule) {
  return schedule.startDate || schedule.date;
}

function getScheduleEndDate(schedule) {
  return schedule.endDate || schedule.date;
}

function isScheduleOnDate(schedule, dateString) {
  const startDate = getScheduleStartDate(schedule);
  const endDate = getScheduleEndDate(schedule);

  return startDate <= dateString && dateString <= endDate;
}

function getScheduleDateText(schedule) {
  if (schedule.startDate && schedule.endDate && schedule.startTime && schedule.endTime) {
    return `${schedule.startDate} ${schedule.startTime} ~ ${schedule.endDate} ${schedule.endTime}`;
  }

  return schedule.date;
}

function getScheduleDotTitle(schedule) {
  const dateText = getScheduleDateText(schedule);

  return dateText ? `${schedule.title} / ${dateText}` : schedule.title;
}

function isScheduleTimeRangeValid(startDate, startTime, endDate, endTime) {
  return `${startDate}T${startTime}` < `${endDate}T${endTime}`;
}

function renderTermLabel() {
  const termTextMap = {
    "1": "1학기",
    "2": "2학기",
    summer: "하계 계절학기",
    winter: "동계 계절학기"
  };

  termLabel.textContent = `${termSettings.grade}학년 ${termTextMap[termSettings.term] || "1학기"}`;
}

function toggleTermSettingsPanel(event) {
  event.stopPropagation();
  termSettingsPanel.hidden = !termSettingsPanel.hidden;
}

function saveTerm() {
  const startDate = termStartDate.value;
  const endDate = termEndDate.value;

  if (startDate !== "" && endDate !== "" && startDate > endDate) {
    alert("학기 시작일은 종료일보다 늦을 수 없습니다.");
    return;
  }

  termSettings = {
    grade: gradeSelect.value,
    term: termSelect.value,
    startDate: startDate,
    endDate: endDate
  };

  saveTermSettings();
  renderTermLabel();
  loadSubjects();
  renderSubjects();
  renderCalendar();
  renderSelectedDateSchedules();
  resetSubjectForm();
  termSettingsPanel.hidden = true;
}

function getDayNameFromDateString(dateString) {
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const date = new Date(`${dateString}T00:00:00`);

  return dayNames[date.getDay()];
}

function getSubjectClassColor(subject) {
  return getCategoryInfo("class").color || "#0f766e";
}

function getClassTitle(subject, classTime) {
  return `${subject.name} / ${subject.room || "-"} / ${subject.professor || "-"} / ${classTime.startTime}~${classTime.endTime}`;
}

function getClassesForDate(dateString) {
  if (!termSettings.startDate || !termSettings.endDate) {
    return [];
  }

  if (dateString < termSettings.startDate || dateString > termSettings.endDate) {
    return [];
  }

  const dayName = getDayNameFromDateString(dateString);
  const classesForDate = [];

  subjects.forEach(function (subject) {
    const classTimes = getRenderableClassTimes(subject);

    classTimes.forEach(function (classTime) {
      if (classTime.day !== dayName) {
        return;
      }

      classesForDate.push({
        subject: subject,
        classTime: classTime,
        color: getSubjectClassColor(subject)
      });
    });
  });

  return classesForDate;
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
      return isScheduleOnDate(schedule, dateString) && isCategorySelected(getCategoryInfo(schedule.category).id);
    });

    schedulesForDate.forEach(function (schedule) {
      const dot = document.createElement("span");
      const categoryInfo = getCategoryInfo(schedule.category);

      dot.classList.add("dot");
      dot.style.backgroundColor = categoryInfo.color;
      dot.title = getScheduleDotTitle(schedule);
      dotContainer.appendChild(dot);
    });

    if (isCategorySelected("class")) {
      getClassesForDate(dateString).forEach(function (classSchedule) {
      const dot = document.createElement("span");

      dot.classList.add("dot", "class-dot");
      dot.style.backgroundColor = classSchedule.color;
      dot.title = getClassTitle(classSchedule.subject, classSchedule.classTime);
      dotContainer.appendChild(dot);
      });
    }

    dayCell.addEventListener("click", function () {
      selectedDate = dateString;
      syncScheduleDateDefault();

      if (isScheduleTimeEnabled() && editingScheduleId === null) {
        scheduleStartDate.value = dateString;
        scheduleEndDate.value = dateString;
      }

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
    return isScheduleOnDate(schedule, selectedDate) && isCategorySelected(getCategoryInfo(schedule.category).id);
  });
  const classesForDate = isCategorySelected("class") ? getClassesForDate(selectedDate) : [];

  if (schedulesForDate.length === 0 && classesForDate.length === 0) {
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
    const categoryInfo = getCategoryInfo(schedule.category);
    categoryBadge.classList.add("category-badge");
    categoryBadge.style.backgroundColor = categoryInfo.color;
    categoryBadge.textContent = categoryInfo.name;

    const dateText = document.createElement("p");
    dateText.textContent = getScheduleDateText(schedule);

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

  classesForDate.forEach(function (classSchedule) {
    const subject = classSchedule.subject;
    const classTime = classSchedule.classTime;
    const classCard = document.createElement("article");
    classCard.classList.add("schedule-card", "class-schedule-card");

    const title = document.createElement("h3");
    title.textContent = `[수업] ${subject.name}`;

    const roomText = document.createElement("p");
    roomText.textContent = `강의실: ${subject.room || "-"}`;

    const professorText = document.createElement("p");
    professorText.textContent = `교수: ${subject.professor || "-"}`;

    const timeText = document.createElement("p");
    timeText.textContent = `시간: ${classTime.startTime}~${classTime.endTime}`;

    classCard.appendChild(title);
    classCard.appendChild(roomText);
    classCard.appendChild(professorText);
    classCard.appendChild(timeText);
    selectedScheduleList.appendChild(classCard);
  });
}

function renderCategories() {
  categoryList.innerHTML = "";

  if (categories.length === 0) {
    const message = document.createElement("p");
    message.classList.add("empty-message");
    message.textContent = "등록된 카테고리가 없습니다.";
    categoryList.appendChild(message);
    return;
  }

  categories.forEach(function (category) {
    const categoryCard = document.createElement("div");
    categoryCard.classList.add("category-card");

    const info = document.createElement("div");
    info.classList.add("category-info");

    const swatch = document.createElement("span");
    swatch.classList.add("category-swatch");
    swatch.style.backgroundColor = category.color;

    const name = document.createElement("span");
    name.textContent = category.name;

    const actions = document.createElement("div");
    actions.classList.add("category-actions");

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.classList.add("small-action-button", "edit");
    editButton.textContent = category.protected ? "색상" : "수정";
    editButton.addEventListener("click", function () {
      startEditCategory(category.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.classList.add("small-action-button", "delete");
    deleteButton.textContent = "삭제";
    deleteButton.disabled = Boolean(category.protected);
    deleteButton.addEventListener("click", function () {
      deleteCategory(category.id);
    });

    info.appendChild(swatch);
    info.appendChild(name);
    actions.appendChild(editButton);
    actions.appendChild(deleteButton);
    categoryCard.appendChild(info);
    categoryCard.appendChild(actions);
    categoryList.appendChild(categoryCard);
  });
}

function refreshCategoryView(selectedValue) {
  saveCategories();
  selectedCategoryIds = selectedCategoryIds.filter(function (categoryId) {
    return categories.some(function (category) {
      return category.id === categoryId;
    });
  });

  if (selectedValue && !selectedCategoryIds.includes(selectedValue)) {
    selectedCategoryIds.push(selectedValue);
  }

  renderCategoryOptions(selectedValue);
  renderCategories();
  renderCategoryFilters();
  renderCalendar();
  renderSelectedDateSchedules();
}

function saveCategory() {
  const name = categoryName.value.trim();
  const color = categoryColor.value;
  const categoryToUpdate = categories.find(function (category) {
    return category.id === editingCategoryId;
  });
  const nextName = categoryToUpdate && categoryToUpdate.protected ? categoryToUpdate.name : name;

  if (nextName === "") {
    alert("카테고리 이름을 입력하세요.");
    return;
  }

  const duplicatedCategory = categories.find(function (category) {
    return category.name === nextName && category.id !== editingCategoryId;
  });

  if (duplicatedCategory) {
    alert("이미 같은 이름의 카테고리가 있습니다.");
    return;
  }

  if (editingCategoryId !== null) {
    if (!categoryToUpdate) {
      resetCategoryForm();
      return;
    }

    categoryToUpdate.name = nextName;
    categoryToUpdate.color = color;
    refreshCategoryView(categoryToUpdate.id);
    resetCategoryForm();
    return;
  }

  const newCategory = {
    id: `category-${Date.now()}`,
    name: name,
    color: color
  };

  categories.push(newCategory);
  refreshCategoryView(newCategory.id);
  resetCategoryForm();
}

function startEditCategory(categoryId) {
  const categoryToEdit = categories.find(function (category) {
    return category.id === categoryId;
  });

  if (!categoryToEdit) {
    return;
  }

  editingCategoryId = categoryId;
  categoryName.value = categoryToEdit.name;
  categoryName.readOnly = Boolean(categoryToEdit.protected);
  categoryColor.value = categoryToEdit.color;
  saveCategoryBtn.textContent = categoryToEdit.protected ? "색상 수정" : "카테고리 수정";
  cancelCategoryEditBtn.hidden = false;
}

function deleteCategory(categoryId) {
  const categoryToDelete = categories.find(function (category) {
    return category.id === categoryId;
  });

  if (categoryToDelete && categoryToDelete.protected) {
    alert("기본 카테고리는 삭제할 수 없습니다.");
    return;
  }

  const shouldDelete = confirm("이 카테고리를 삭제하시겠습니까?");

  if (!shouldDelete) {
    return;
  }

  categories = categories.filter(function (category) {
    return category.id !== categoryId;
  });

  const fallbackCategory = categories[0] ? categories[0].id : "";

  schedules.forEach(function (schedule) {
    if (
      schedule.category === categoryId ||
      (categoryToDelete && schedule.category === categoryToDelete.name)
    ) {
      schedule.category = fallbackCategory;
    }
  });
  saveSchedules();

  if (editingCategoryId === categoryId) {
    resetCategoryForm();
  }

  refreshCategoryView(fallbackCategory);
}

function cancelCategoryEdit() {
  resetCategoryForm();
}

function toggleCategoryPanel() {
  const isHidden = categoryPanelBody.hidden;

  categoryPanelBody.hidden = !isHidden;
  toggleCategoryPanelBtn.textContent = isHidden ? "접기" : "펼치기";
  toggleCategoryPanelBtn.setAttribute("aria-expanded", String(isHidden));
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
  scheduleCategory.value = getCategoryInfo(scheduleToEdit.category).id;
  scheduleMemo.value = scheduleToEdit.memo;

  if (scheduleToEdit.startDate && scheduleToEdit.endDate && scheduleToEdit.startTime && scheduleToEdit.endTime) {
    scheduleTimePanel.hidden = false;
    toggleScheduleTimeBtn.textContent = "시간 설정 닫기";
    toggleScheduleTimeBtn.setAttribute("aria-expanded", "true");
    scheduleStartDate.value = scheduleToEdit.startDate;
    scheduleStartTime.value = scheduleToEdit.startTime;
    scheduleEndDate.value = scheduleToEdit.endDate;
    scheduleEndTime.value = scheduleToEdit.endTime;
  } else {
    hideScheduleTimePanel();
  }

  addScheduleBtn.textContent = "일정 수정";
  cancelEditBtn.hidden = false;
}

function updateSchedule(title, date, category, memo, timeData) {
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

  delete scheduleToUpdate.startDate;
  delete scheduleToUpdate.startTime;
  delete scheduleToUpdate.endDate;
  delete scheduleToUpdate.endTime;

  if (timeData) {
    scheduleToUpdate.date = timeData.startDate;
    scheduleToUpdate.startDate = timeData.startDate;
    scheduleToUpdate.startTime = timeData.startTime;
    scheduleToUpdate.endDate = timeData.endDate;
    scheduleToUpdate.endTime = timeData.endTime;
  }

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
  let timeData = null;

  // 제목과 날짜는 일정을 구분하는 데 꼭 필요하므로 비어 있으면 알려준다.
  if (title === "" || (!isScheduleTimeEnabled() && date === "")) {
    alert("일정 제목과 날짜를 입력하세요.");
    return;
  }

  if (category === "") {
    alert("카테고리를 먼저 추가하세요.");
    return;
  }

  if (isScheduleTimeEnabled()) {
    const startDate = scheduleStartDate.value;
    const startTime = scheduleStartTime.value;
    const endDate = scheduleEndDate.value;
    const endTime = scheduleEndTime.value;

    if (startDate === "" || startTime === "" || endDate === "" || endTime === "") {
      alert("시작일, 시작시각, 종료일, 종료시각을 입력하세요.");
      return;
    }

    if (!isScheduleTimeRangeValid(startDate, startTime, endDate, endTime)) {
      alert("일정 시작 일시는 종료 일시보다 빨라야 합니다.");
      return;
    }

    timeData = {
      startDate: startDate,
      startTime: startTime,
      endDate: endDate,
      endTime: endTime
    };
  }

  if (editingScheduleId !== null) {
    updateSchedule(title, date, category, memo, timeData);
    return;
  }

  const newSchedule = {
    id: Date.now(),
    title: title,
    date: timeData ? timeData.startDate : date,
    category: category,
    memo: memo
  };

  if (timeData) {
    newSchedule.startDate = timeData.startDate;
    newSchedule.startTime = timeData.startTime;
    newSchedule.endDate = timeData.endDate;
    newSchedule.endTime = timeData.endTime;
  }

  schedules.push(newSchedule);
  console.log(schedules);
  refreshScheduleView();
  resetScheduleForm();
}

function cancelEditSchedule() {
  resetScheduleForm();
}

function getTimetableRow(time) {
  const parts = time.split(":");
  const hour = Number(parts[0]);
  const minute = Number(parts[1]);
  const halfHourIndex = (hour - 8) * 2 + (minute >= 30 ? 1 : 0);

  return halfHourIndex + 2;
}

function getSubjectColor(index) {
  const colors = ["#f97316", "#10b981", "#3b82f6", "#8b5cf6", "#22c55e", "#ec4899", "#14b8a6", "#f59e0b"];

  return colors[index % colors.length];
}

function renderSubjects() {
  const days = ["월", "화", "수", "목", "금", "토"];
  const hours = Array.from({ length: 13 }, function (_, index) {
    return 8 + index;
  });

  timetableGrid.innerHTML = "";

  const cornerCell = document.createElement("div");
  cornerCell.classList.add("timetable-cell", "header");
  cornerCell.style.gridColumn = "1";
  cornerCell.style.gridRow = "1";
  timetableGrid.appendChild(cornerCell);

  days.forEach(function (day, index) {
    const headerCell = document.createElement("div");
    headerCell.classList.add("timetable-cell", "header");
    headerCell.textContent = day;
    headerCell.style.gridColumn = String(index + 2);
    headerCell.style.gridRow = "1";
    timetableGrid.appendChild(headerCell);
  });

  hours.forEach(function (hour, index) {
    const timeCell = document.createElement("div");
    timeCell.classList.add("timetable-cell", "time");
    timeCell.textContent = String(hour);
    timeCell.style.gridColumn = "1";
    timeCell.style.gridRow = `${index * 2 + 2} / span 2`;
    timetableGrid.appendChild(timeCell);

    days.forEach(function (_, dayIndex) {
      const firstHalfCell = document.createElement("div");
      firstHalfCell.classList.add("timetable-cell");
      firstHalfCell.style.gridColumn = String(dayIndex + 2);
      firstHalfCell.style.gridRow = String(index * 2 + 2);
      timetableGrid.appendChild(firstHalfCell);

      const secondHalfCell = document.createElement("div");
      secondHalfCell.classList.add("timetable-cell");
      secondHalfCell.style.gridColumn = String(dayIndex + 2);
      secondHalfCell.style.gridRow = String(index * 2 + 3);
      timetableGrid.appendChild(secondHalfCell);
    });
  });

  subjects.forEach(function (subject, subjectIndex) {
    const classTimes = getRenderableClassTimes(subject);

    classTimes.forEach(function (classTime) {
      const dayIndex = days.indexOf(classTime.day);

      if (dayIndex === -1) {
        return;
      }

      const startRow = getTimetableRow(classTime.startTime);
      const endRow = getTimetableRow(classTime.endTime);
      const rowSpan = Math.max(endRow - startRow, 1);

      if (startRow < 2 || startRow > 27) {
        return;
      }

      const subjectBlock = document.createElement("button");
      subjectBlock.type = "button";
      subjectBlock.classList.add("subject-block");
      subjectBlock.style.gridColumn = String(dayIndex + 2);
      subjectBlock.style.gridRow = `${startRow} / span ${rowSpan}`;
      subjectBlock.style.background = getSubjectColor(subjectIndex);

      const subjectNameText = document.createElement("span");
      subjectNameText.textContent = subject.name;

      subjectBlock.appendChild(subjectNameText);
      subjectBlock.addEventListener("mouseenter", function () {
        showSubjectHoverCard(subject, classTime, subjectBlock);
      });
      subjectBlock.addEventListener("mouseleave", hideSubjectHoverCard);
      subjectBlock.addEventListener("click", function (event) {
        event.stopPropagation();
        showSubjectActionPopover(subject.id, subjectBlock);
      });

      timetableGrid.appendChild(subjectBlock);
    });
  });
}

function getRenderableClassTimes(subject) {
  if (Array.isArray(subject.classTimes)) {
    return subject.classTimes;
  }

  if (Array.isArray(subject.days)) {
    return subject.days.map(function (day) {
      return {
        day: day,
        startTime: subject.startTime,
        endTime: subject.endTime
      };
    });
  }

  if (subject.day) {
    return [
      {
        day: subject.day,
        startTime: subject.startTime,
        endTime: subject.endTime
      }
    ];
  }

  return [];
}

function refreshSubjectView() {
  saveSubjects();
  hideSubjectHoverCard();
  hideSubjectActionPopover();
  renderSubjects();
  renderCalendar();
  renderSelectedDateSchedules();
}

function saveSubject() {
  const name = subjectName.value.trim();
  const professor = professorName.value.trim();
  const room = classroom.value.trim();
  const classTimes = getSubjectClassTimes();

  const hasEmptyTime = classTimes.some(function (classTime) {
    return classTime.startTime === "" || classTime.endTime === "";
  });

  if (name === "" || classTimes.length === 0 || hasEmptyTime) {
    alert("과목명, 요일, 시작 시간, 종료 시간을 입력하세요.");
    return;
  }

  const hasInvalidTime = classTimes.some(function (classTime) {
    return classTime.startTime >= classTime.endTime;
  });

  if (hasInvalidTime) {
    alert("시작 시간은 종료 시간보다 빨라야 합니다.");
    return;
  }

  if (editingSubjectId !== null) {
    updateSubject(name, professor, room, classTimes);
    return;
  }

  const newSubject = {
    id: Date.now(),
    name: name,
    professor: professor,
    room: room,
    days: classTimes.map(function (classTime) {
      return classTime.day;
    }),
    classTimes: classTimes
  };

  subjects.push(newSubject);
  refreshSubjectView();
  resetSubjectForm();
}

function startEditSubject(subjectId, anchorElement) {
  const subjectToEdit = subjects.find(function (subject) {
    return subject.id === subjectId;
  });

  if (!subjectToEdit) {
    return;
  }

  editingSubjectId = subjectId;
  subjectName.value = subjectToEdit.name;
  professorName.value = subjectToEdit.professor;
  classroom.value = subjectToEdit.room;
  setSubjectClassTimes(subjectToEdit.classTimes);
  subjectFormPanel.hidden = false;
  subjectFormPanel.classList.add("edit-floating");
  positionSubjectEditPanel(anchorElement || activeSubjectAnchor);
  subjectFormTitle.textContent = "과목 수정";
  saveSubjectBtn.textContent = "과목 수정";
  deleteSubjectBtn.hidden = true;
  cancelSubjectEditBtn.hidden = false;
  hideSubjectActionPopover();
}

function updateSubject(name, professor, room, classTimes) {
  const subjectToUpdate = subjects.find(function (subject) {
    return subject.id === editingSubjectId;
  });

  if (!subjectToUpdate) {
    resetSubjectForm();
    return;
  }

  subjectToUpdate.name = name;
  subjectToUpdate.professor = professor;
  subjectToUpdate.room = room;
  subjectToUpdate.days = classTimes.map(function (classTime) {
    return classTime.day;
  });
  subjectToUpdate.classTimes = classTimes;

  refreshSubjectView();
  resetSubjectForm();
}

function deleteSubject(subjectId) {
  const shouldDelete = confirm("이 과목을 삭제하시겠습니까?");

  if (!shouldDelete) {
    return;
  }

  subjects = subjects.filter(function (subject) {
    return subject.id !== subjectId;
  });

  if (editingSubjectId === subjectId) {
    resetSubjectForm();
  }

  refreshSubjectView();
}

function cancelSubjectEdit() {
  resetSubjectForm();
}

function deleteEditingSubject() {
  if (editingSubjectId === null) {
    return;
  }

  deleteSubject(editingSubjectId);
}

function editActiveSubject() {
  if (activeSubjectId === null) {
    return;
  }

  startEditSubject(activeSubjectId, activeSubjectAnchor);
}

function deleteActiveSubject() {
  if (activeSubjectId === null) {
    return;
  }

  deleteSubject(activeSubjectId);
  hideSubjectActionPopover();
}


// 버튼 클릭 이벤트를 함수와 연결하는 영역
prevMonthButton.addEventListener("click", goPrevMonth);
nextMonthButton.addEventListener("click", goNextMonth);
addScheduleBtn.addEventListener("click", addSchedule);
cancelEditBtn.addEventListener("click", cancelEditSchedule);
toggleScheduleTimeBtn.addEventListener("click", toggleScheduleTimePanel);
scheduleDate.addEventListener("change", handleScheduleDateChange);
selectAllCategoriesBtn.addEventListener("click", selectAllCategories);
clearAllCategoriesBtn.addEventListener("click", clearAllCategories);
saveCategoryBtn.addEventListener("click", saveCategory);
cancelCategoryEditBtn.addEventListener("click", cancelCategoryEdit);
toggleCategoryPanelBtn.addEventListener("click", toggleCategoryPanel);
openTermSettingsBtn.addEventListener("click", toggleTermSettingsPanel);
termSettingsPanel.addEventListener("click", function (event) {
  event.stopPropagation();
});
saveTermSettingsBtn.addEventListener("click", saveTerm);
openSubjectFormBtn.addEventListener("click", openSubjectForm);
closeSubjectFormBtn.addEventListener("click", closeSubjectForm);
saveSubjectBtn.addEventListener("click", saveSubject);
deleteSubjectBtn.addEventListener("click", deleteEditingSubject);
cancelSubjectEditBtn.addEventListener("click", cancelSubjectEdit);
popoverEditSubjectBtn.addEventListener("click", editActiveSubject);
popoverDeleteSubjectBtn.addEventListener("click", deleteActiveSubject);
subjectActionPopover.addEventListener("click", function (event) {
  event.stopPropagation();
});
subjectDayCheckboxes.forEach(function (checkbox) {
  checkbox.addEventListener("change", syncClassTimeInputState);
});
subjectDayStartInputs.forEach(function (input) {
  input.addEventListener("change", handleSubjectStartTimeChange);
});
subjectDayEndInputs.forEach(function (input) {
  input.addEventListener("change", handleSubjectEndTimeChange);
});
document.addEventListener("click", function () {
  hideSubjectActionPopover();
  termSettingsPanel.hidden = true;
});

// 페이지가 처음 열릴 때 현재 달력을 한 번 출력한다.
loadSchedules();
loadCategories();
selectEveryCategory();
renderCategoryOptions();
renderCategories();
renderCategoryFilters();
loadTermSettings();
loadSubjects();
syncClassTimeInputState();
selectedDate = getDefaultScheduleDate();
syncScheduleDateDefault();
renderCalendar();
renderSelectedDateSchedules();
renderSubjects();
