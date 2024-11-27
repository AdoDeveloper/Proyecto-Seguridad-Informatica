const Handlebars = require('handlebars');

// Helper para formatear una fecha en formato dd/mm/aaaa hh:mm:ss en horario América Central/El Salvador
Handlebars.registerHelper('formatDate', function (date) {
    if (!date) return '';

    // Convertir la fecha a la zona horaria América Central/El Salvador (UTC-6)
    const options = {
        timeZone: 'America/El_Salvador',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    };
    
    const formattedDate = new Date(date).toLocaleString('es-SV', options);
    
    return formattedDate.replace(',', ''); // Eliminar la coma para obtener el formato deseado
});

module.exports = Handlebars;
