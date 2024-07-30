// Выполнение GET-запроса на /map
fetch('/map')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json(); // Предполагается, что сервер возвращает JSON
  })
  .then(data => {
    console.log(data); // Обработка полученных данных
  })
  .catch(error => {
    console.error('There has been a problem with your fetch operation:', error);
  });
