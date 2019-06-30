let socket = io.connect('http://' + window.location.hostname);

socket.on('doorSwitch', function (data) {
    if (data.doorClosed) {
        console.log("door is closed");
    } else {
        console.log("door is open");
    }

    console.log(data);
});

function sendNewVolume(volume) {
    $.post('http://' + window.location.hostname + '/setVolume?volume=' + volume);
}

$(document).ready(() => {
    $('#reboot').click(() => {
        if (confirm('Are you sure you want to reboot?')) {
            $.post('http://' + window.location.hostname + '/reboot');
        }
    });

    $('#shutdown').click(() => {
        if (confirm('Are you sure you want to shutdown?')) {
            $.post('http://' + window.location.hostname + '/shutdown');
        }
    });
});

