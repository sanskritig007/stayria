(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  });

  // Auto-dismiss custom flash alerts after 5 seconds
  setTimeout(() => {
    const flashAlerts = document.querySelectorAll('.custom-flash-alert');
    flashAlerts.forEach(alert => {
      // Use Bootstrap's alert instance to close it with animation
      const bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
      bsAlert.close();
    });
  }, 5000);
})()