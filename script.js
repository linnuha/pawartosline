// Konfigurasi Firebase
var firebaseConfig = {
    apiKey: "AIzaSyAPFHFyP0V6CYZWpWrPUpzJSXXyB6KEyaE",
    authDomain: "daftarhadir-e4d51.firebaseapp.com",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "daftarhadir-e4d51",
    storageBucket: "daftarhadir-e4d51.appspot.com",
    messagingSenderId: "189970254216",
    appId: "1:189970254216:web:062ce3aad8c18dbdb0123d"
};
firebase.initializeApp(firebaseConfig);

var database = firebase.database();

// Initialize Signature Pad
var canvas = document.querySelector("#signature-pad canvas");
var signaturePad = new SignaturePad(canvas);

// Adjust canvas size
function resizeCanvas() {
    var ratio =  Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d").scale(ratio, ratio);
    signaturePad.clear(); // otherwise isEmpty() might return incorrect value
}

window.onresize = resizeCanvas;
resizeCanvas();

// Clear signature pad
document.getElementById('clear-signature').addEventListener('click', function() {
    signaturePad.clear();
});

// Submit Form
document.getElementById('attendance-form').addEventListener('submit', function(e) {
    e.preventDefault();

    var name = document.getElementById('name').value;
    var date = new Date().toLocaleString();
    var signature = signaturePad.toDataURL();

    var newEntry = database.ref('attendance').push();
    newEntry.set({
        name: name,
        date: date,
        signature: signature
    });

    document.getElementById('attendance-form').reset();
    signaturePad.clear();
});

// Fetch Data
database.ref('attendance').on('value', function(snapshot) {
    var attendanceList = document.getElementById('attendance-list');
    attendanceList.innerHTML = '';
    var counter = 1;

    snapshot.forEach(function(childSnapshot) {
        var childData = childSnapshot.val();
        var row = attendanceList.insertRow();
        row.insertCell(0).innerText = counter++;
        row.insertCell(1).innerText = childData.name;
        row.insertCell(2).innerText = childData.date;

        var signatureCell = row.insertCell(3);
        if (childData.signature) {
            var img = document.createElement('img');
            img.src = childData.signature;
            img.style.width = '150px';
            signatureCell.appendChild(img);
        }
    });
});

// Export to Excel
document.getElementById('export').addEventListener('click', function() {
    var data = [];
    var rows = document.querySelectorAll('table tr');
    
    for (var i = 0; i < rows.length; i++) {
        var row = [], cols = rows[i].querySelectorAll('td, th');
        
        for (var j = 0; j < cols.length; j++) {
            row.push(cols[j].innerText);
        }
        
        data.push(row);
    }
    
    var worksheet = XLSX.utils.aoa_to_sheet(data);
    var workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Daftar Hadir");
    XLSX.writeFile(workbook, 'daftar_hadir.xlsx');
});