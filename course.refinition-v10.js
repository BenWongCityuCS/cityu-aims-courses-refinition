let userLanguages = ["English"];
//No preferred Languages: let userLanguages = [];
//preferred Putonghua: let userLanguages = ["Putonghua"];
//preferred English or Putonghua: let userLanguages = ["English","Putonghua"];
//preferred more....

let userCourse=[
    // { CRN: '10505', Day: 'R', 'Time': '12:00 - 14:50'},
    // { CRN: '10507', Day: 'T', 'Time': '19:00 - 21:50'},
    //{ CRN: '10507', Day: 'R', 'Time': '19:00 - 21:50'},
    // { CRN: '10510', Day: 'T', 'Time': '09:00 - 11:50'},
    // { CRN: '11119', Day: 'R', 'Time': '15:00 - 16:50'},
    //  { CRN: '10356', Day: 'F', 'Time': '17:00 - 18:50'},
    //  { CRN: '10024', Day: 'W', 'Time': '09:00 - 11:50'},
    //  { CRN: '12588', Day: 'M', 'Time': '15:00 - 15:50'},
    //  { CRN: '11126', Day: 'M', 'Time': '09:00 - 11:50'},
    // { CRN: '11308', Day: 'W', 'Time': '13:00 - 13:50'},
    // { CRN: '10865', Day: 'F', 'Time': '12:00 - 14:50'},
    //  { CRN: '12674', Day: 'S', 'Time': '13:00 - 15:50'},
    //  { CRN: '12039', Day: 'T', 'Time': '16:00 - 16:50'}
    
];

const table = document.querySelector('table'); 

let data = []; 
let courses = {}; 
let filteredCRNs = new Set();

userLanguages = userLanguages.map(lang => lang.trim().toLowerCase());

function timeToMin(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

function hasTimeConflict(courseData, userCourse) {
    return userCourse.some(user => {
      return user.Day === courseData.Day && isTimeOverlap(user.Time, courseData.Time);
    });
  }
  
  function isTimeOverlap(time1, time2) {
    const [start1, end1] = time1.split(' - ');
    const [start2, end2] = time2.split(' - ');
  
    const [hours1Start, minutes1Start] = start1.split(':').map(Number);
    const [hours1End, minutes1End] = end1.split(':').map(Number);
    const [hours2Start, minutes2Start] = start2.split(':').map(Number);
    const [hours2End, minutes2End] = end2.split(':').map(Number);
  
    const start1InMinutes = hours1Start * 60 + minutes1Start;
    const end1InMinutes = hours1End * 60 + minutes1End;
    const start2InMinutes = hours2Start * 60 + minutes2Start;
    const end2InMinutes = hours2End * 60 + minutes2End;
  
    return (start1InMinutes < end2InMinutes && end1InMinutes > start2InMinutes);
  }


function addCourseToCategory(restriction, courseData) {
    const restrictionKey = restriction || 'No Restriction'; 
    courses[restrictionKey] = courses[restrictionKey] || []; 
    courses[restrictionKey].push(courseData);
}

function isNotNaN(value) {
    return !isNaN(value) && value !== 'NaN';
}


function addFirstRowToSecondRow(firstRow, secondRow) {
    for (let i = 0; i < 9; i++) {
      const firstCell = firstRow.cells[i];
      const secondCell = secondRow.cells[i];
      if (secondCell.textContent.trim() === '') {
        secondCell.textContent = firstCell.textContent;
      }

      if(i == 6){
        let word = firstCell.textContent;
        word = word.replace(':','')
        secondCell.textContent = word ;
      }
    }
  }
  
  for (let i = 1; i < table.rows.length; i++) { 
    let currentRow = table.rows[i];

    if (currentRow.cells.length ==16 &&  
    currentRow.cells[0].textContent.trim() === '' && 
    currentRow.cells[1].textContent.trim() === ''&& 
    currentRow.cells[2].textContent.trim() === ''&& 
    currentRow.cells[3].textContent.trim() === ''&& 
    currentRow.cells[4].textContent.trim() === ''&& 
    currentRow.cells[5].textContent.trim() === ''&& 
    currentRow.cells[6].textContent.trim() === ''&& 
    currentRow.cells[7].textContent.trim() === ''&& 
    currentRow.cells[8].textContent.trim() === ''
    ) {
    let num1=-1;
    let previousRow =table.rows[i - 1];
    while(i+num1>=0){
        let checkRow = table.rows[i+num1];
        if (checkRow.cells.length ==16){
            previousRow = table.rows[i+num1];
            break;
        }
        num1--;
    }
    addFirstRowToSecondRow(previousRow, currentRow);
    }
}

for (let i = 1; i < table.rows.length; i++) {
    let row = table.rows[i];
    let restrictions = [];

    let count =1;
    let currentRow = table.rows[i + count];
    while(currentRow && currentRow.cells.length == 2){
        let restriction = currentRow.cells[1].textContent.trim();
        if (restriction && !restrictions.includes(restriction)) {
            restrictions.push(restriction);
        }
        count++;
        currentRow = table.rows[i + count];
    }

    let [crn, section,, , , , avail, cap,,date , day, time,, , , medium] = Array.from(row.cells, cell => cell.innerText.trim());
    const chance = isNotNaN(avail) && isNotNaN(cap) && cap !== 0 ? avail / cap : 0;
    const courseData = {
        CRN: crn.toString(),
        Section: section,
        Chance: chance.toFixed(2),
        Day: day,
        Time: time,
        Medium: medium,
        Date: date
    };

    if (userLanguages.length>0 && !userLanguages.includes(String(courseData.Medium).toLowerCase())) {
        continue;
    }

    if(!isNotNaN(courseData.Chance)||courseData.Chance==0.00){
        let valueToAdd = courseData.CRN;
        if (!isNaN(parseInt(valueToAdd))) {
            filteredCRNs.add(valueToAdd);
        } 
        continue;
    }

    if(hasTimeConflict(courseData, userCourse)){
        let valueToAdd = courseData.CRN;
        if (!isNaN(parseInt(valueToAdd))) {
            filteredCRNs.add(valueToAdd);
        } 
        continue;
    }

    let checkValue = courseData.CRN;
    if (!(filteredCRNs.has(checkValue))) {
        data.push(courseData);
    }

    let restrictionCategory = restrictions.join(' & ') || 'No Restriction';
    addCourseToCategory(restrictionCategory, courseData);
}




function addCourseToCategory(restriction, courseData) {
    
    const restrictionKey = restriction || 'No Restriction';
    courses[restrictionKey] = courses[restrictionKey] || [];

    courses[restrictionKey].push(courseData);

    courses[restrictionKey].sort((a, b) => {
        let dayComparison = getDayFromString(a.Day) - getDayFromString(b.Day);
        if (dayComparison !== 0) return dayComparison;
        
        return timeToMin(a.Time.split(' - ')[0]) - timeToMin(b.Time.split(' - ')[0]);
    });
}


function getDayFromString(dayStr) {
    const days = ['M', 'T', 'W', 'R', 'F', 'S','U'];
    return days.indexOf(dayStr);
}

function removeCoursesInFilteredCRNs(filteredCRNs) {
    for (const restrictionKey of Object.keys(courses)) {
        courses[restrictionKey] = courses[restrictionKey].filter(courseData => !filteredCRNs.has(courseData.CRN));
    }
}

removeCoursesInFilteredCRNs(filteredCRNs);


for (const key in courses) {
    if (Array.isArray(courses[key]) && courses[key].length === 0) {
        delete courses[key];
    }
}


for (const restrictionKey in courses) {
    const coursesArray = courses[restrictionKey];
    
    const crnMap = {};
    
    for (const course of coursesArray) {
        if (!crnMap[course.CRN]) {
            crnMap[course.CRN] = [];
        }
        crnMap[course.CRN].push(course);
    }
    
    coursesArray.length = 0;
    
    for (const crn in crnMap) {
        const sameCrnCourses = crnMap[crn];
        
        if (sameCrnCourses.length > 1) {
            const courseData = sameCrnCourses[0];
            const dates = sameCrnCourses.map(course => course.Date);
            courseData.Date = dates.join(' Or ');
            coursesArray.push(courseData);
        } else {
            coursesArray.push(sameCrnCourses[0]);
        }
    }
}


for (const restrictionKey in courses) {
    courses[restrictionKey] = courses[restrictionKey].filter((value, index, self) =>
        index === self.findIndex((t) => (
            t.CRN === value.CRN && t.Time === value.Time
        ))
    );
    courses[restrictionKey].sort((a, b) => {
        let dayComparison = getDayFromString(a.Day) - getDayFromString(b.Day);
        if (dayComparison !== 0) return dayComparison;
        
        return timeToMin(a.Time.split(' - ')[0]) - timeToMin(b.Time.split(' - ')[0]);
    });
}

console.log(courses);
