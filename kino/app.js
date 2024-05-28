document.addEventListener('DOMContentLoaded', () => {
    const maxSeats = 25;
    const sessions = ["10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];
    const maxBookingPeriod = 7; // Maximum booking period in days

    const datePicker = document.getElementById('date-picker');
    const timePicker = document.getElementById('time-picker');
    const seatsContainer = document.getElementById('seats-container');
    const reserveButton = document.getElementById('reserve-button');

    // Set minimum date to today and maximum date to 7 days from today
    const today = new Date();
    datePicker.min = formatDate(today);
    datePicker.max = formatDate(new Date(today.getTime() + maxBookingPeriod * 24 * 60 * 60 * 1000));

    // Populate time picker with sessions
    sessions.forEach(session => {
        const option = document.createElement('option');
        option.value = session;
        option.textContent = session;
        timePicker.appendChild(option);
    });

    // Generate seats
    function generateSeats() {
        seatsContainer.innerHTML = '';
        for (let i = 1; i <= maxSeats; i++) {
            const seat = document.createElement('div');
            seat.classList.add('seat');
            seat.textContent = i;
            seat.addEventListener('click', () => selectSeat(seat));
            seatsContainer.appendChild(seat);
        }
    }

    // Load seats from cookies if available
    function loadSeats() {
        generateSeats();
        const data = getCookie('bookings');
        if (data) {
            const bookings = JSON.parse(data);
            const date = datePicker.value;
            const session = timePicker.value;
            const key = `${date}_${session}`;
            if (bookings[key]) {
                const reservedSeats = bookings[key];
                const seats = seatsContainer.querySelectorAll('.seat');
                reservedSeats.forEach(seatNumber => {
                    const seat = seats[seatNumber - 1];
                    seat.classList.add('reserved');
                    seat.removeEventListener('click', () => selectSeat(seat));
                });
            }
        }
    }

    // Save reserved seats to cookies
    function saveSeats() {
        const date = datePicker.value;
        const session = timePicker.value;
        const key = `${date}_${session}`;
        const reservedSeats = [];
        const seats = seatsContainer.querySelectorAll('.seat.reserved');
        seats.forEach(seat => {
            reservedSeats.push(parseInt(seat.textContent));
        });

        let bookings = getCookie('bookings');
        bookings = bookings ? JSON.parse(bookings) : {};
        bookings[key] = reservedSeats;
        const bookingsJSON = JSON.stringify(bookings);
        setCookie('bookings', bookingsJSON, 7);
        console.log(`Saved seats for ${key}: ${bookingsJSON}`);
        console.log(`Current cookies: ${document.cookie}`);
    }

    // Handle seat selection
    function selectSeat(seat) {
        if (!seat.classList.contains('reserved')) {
            seat.classList.toggle('selected');
        }
    }

    // Handle reserve button click
    reserveButton.addEventListener('click', () => {
        const selectedSeats = seatsContainer.querySelectorAll('.seat.selected');
        selectedSeats.forEach(seat => {
            seat.classList.remove('selected');
            seat.classList.add('reserved');
            seat.removeEventListener('click', () => selectSeat(seat));
        });
        saveSeats();
    });

    // Utility functions
    function formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    function setCookie(name, value, days) {
        const d = new Date();
        d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${d.toUTCString()}`;
        document.cookie = `${name}=${value}; ${expires}; path=/; samesite=strict; secure`;
        console.log(`Set cookie: ${name}=${value}; ${expires}`);
    }

    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    // Event listeners
    datePicker.addEventListener('change', loadSeats);
    timePicker.addEventListener('change', loadSeats);

    // Initialize seats
    datePicker.value = formatDate(today);
    timePicker.value = sessions[0];
    loadSeats();
});
