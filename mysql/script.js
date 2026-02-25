document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btnEjecutar');
    const input = document.getElementById('sqlInput');
    const container = document.getElementById('resultTableContainer');
    const status = document.getElementById('statusMessage');

    btn.addEventListener('click', async () => {
        const query = input.value;
        
        if (!query.trim()) {
            status.innerText = "Por favor, escribe un comando.";
            status.style.color = "orange";
            return;
        }

        try {
            status.innerText = "Ejecutando...";
            status.style.color = "blue";
            
            const response = await fetch('http://localhost:3000/ejecutar-sql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sql: query })
            });

            const result = await response.json();

            if (result.success) {
                status.innerText = "Comando ejecutado con éxito.";
                status.style.color = "green";
                renderTable(result.data);
            } else {
                status.innerText = "Error: " + result.message;
                status.style.color = "red";
                container.innerHTML = "";
            }
        } catch (err) {
            status.innerText = "No se pudo conectar con el servidor. ¿Olvidaste correr 'node index.js'?";
            status.style.color = "red";
            console.error(err);
        }
    });

    function renderTable(data) {
        container.innerHTML = "";
        
        // Si no hay datos o no es un array (INSERT/UPDATE/DELETE)
        if (!Array.isArray(data)) {
            container.innerHTML = `<p style="color: green;">Operación realizada correctamente.</p>`;
            return;
        }
        
        if (data.length === 0) {
            container.innerHTML = `<p>La consulta no devolvió resultados.</p>`;
            return;
        }

        // Crear tabla
        const table = document.createElement('table');
        
        // Crear encabezados
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const columns = Object.keys(data[0]);
        
        columns.forEach(column => {
            const th = document.createElement('th');
            th.textContent = column;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Crear filas de datos
        const tbody = document.createElement('tbody');
        data.forEach(row => {
            const tr = document.createElement('tr');
            columns.forEach(column => {
                const td = document.createElement('td');
                td.textContent = row[column] !== null ? row[column] : 'NULL';
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        
        container.appendChild(table);
    }
});