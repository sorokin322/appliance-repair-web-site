(function () {
  'use strict';

  // --- Header scroll effect ---
  const header = document.getElementById('header');

  function onScroll() {
    if (window.scrollY > 10) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // --- Mobile navigation ---
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');

  hamburger.addEventListener('click', function () {
    const isOpen = nav.classList.toggle('open');
    hamburger.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.classList.toggle('modal-open', isOpen);
  });

  nav.querySelectorAll('.header__nav-link').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('modal-open');
    });
  });

  // --- Booking modal ---
  var modal = document.getElementById('bookingModal');

  document.querySelectorAll('[data-book]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      openModal();
    });
  });

  document.querySelectorAll('[data-close-modal]').forEach(function (el) {
    el.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  function openModal() {
    modal.classList.add('active');
    document.body.classList.add('modal-open');
    modal.querySelector('.booking-form__input').focus();
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
  }

  // --- Scroll reveal animations ---
  var animateElements = document.querySelectorAll(
    '.feature-card, .service-card, .review-card, .about__text, .section__header'
  );

  animateElements.forEach(function (el) {
    el.classList.add('fade-in');
  });

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    animateElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    animateElements.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  // --- Booking form (disabled, ready for Resend integration) ---
  var bookingForm = document.getElementById('bookingForm');

  bookingForm.addEventListener('submit', function (e) {
    e.preventDefault();
    // RESEND INTEGRATION: uncomment and configure the code below
    // once your Resend account is set up.
    //
    // var formData = {
    //   name: document.getElementById('bookName').value,
    //   email: document.getElementById('bookEmail').value,
    //   phone: document.getElementById('bookPhone').value,
    //   message: document.getElementById('bookMessage').value
    // };
    //
    // fetch('YOUR_SERVERLESS_ENDPOINT_URL', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(formData)
    // })
    // .then(function (response) { return response.json(); })
    // .then(function (data) {
    //   alert('Thank you! Your request has been sent.');
    //   bookingForm.reset();
    //   closeModal();
    // })
    // .catch(function (error) {
    //   alert('Something went wrong. Please call us directly.');
    //   console.error('Booking error:', error);
    // });
  });
})();
