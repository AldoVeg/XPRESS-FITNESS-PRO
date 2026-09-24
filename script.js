const year = document.getElementById("year");
if (year) {
  year.textContent = new Date().getFullYear();
}

const countdown = () => {
  const target = new Date();
  target.setDate(target.getDate() + 7);
  target.setHours(target.getHours() + 12);
  target.setMinutes(target.getMinutes() + 39);

  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");

  const update = () => {
    const now = new Date();
    const diff = Math.max(target.getTime() - now.getTime(), 0);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    if (daysEl) daysEl.textContent = String(days).padStart(2, "0");
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, "0");
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, "0");
  };

  update();
  setInterval(update, 60000);
};

countdown();

const form = document.querySelector(".contact-form");
if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const nameInput = document.getElementById("nameInput");
    const emailInput = document.getElementById("emailInput");
    const button = form.querySelector("button");
    const originalText = button.textContent;

    const name = nameInput ? nameInput.value.trim() : "Cliente";
    const email = emailInput ? emailInput.value.trim() : "";

    const message = encodeURIComponent(
      `Hola XPRESS Fitness PRO, quiero cotizar una máquina. Nombre: ${name}. Correo: ${email}.`
    );

    button.textContent = "Redirigiendo...";
    button.disabled = true;

    window.open(`https://wa.me/51944861404?text=${message}`, "_blank");

    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
      form.reset();
    }, 1800);
  });
}
