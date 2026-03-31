document.addEventListener('DOMContentLoaded', function () {

  // ===========================
  // CONFIG
  // ===========================
  const API_URL = "/projects";


  // ===========================
  // FOOTER YEAR
  // ===========================
  const footerYear = document.getElementById('footer-year');
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }


  // ===========================
  // CRUD SECTION
  // ===========================
  let editingId = null;


  // 🔹 READ
  async function renderProjects() {
    const container = document.getElementById('live-projects-list');
    if (!container) return;

    try {
      const res = await fetch(API_URL);
      const projects = await res.json();

      container.innerHTML = '';

      if (!projects || projects.length === 0) {
        container.innerHTML = '<p>No projects yet.</p>';
        return;
      }

      projects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'live-project-card';

        card.innerHTML = `
          <h4>${project.title}</h4>
          <p><strong>Tech:</strong> ${project.tech}</p>
          <p>${project.description}</p>
          <button onclick="editProject(${project.id})">Edit</button>
          <button onclick="deleteProject(${project.id})">Delete</button>
        `;

        container.appendChild(card);
      });

    } catch (err) {
      console.error("Error fetching projects:", err);
      container.innerHTML = "<p>Failed to load projects.</p>";
    }
  }


  // 🔹 CREATE + UPDATE
  const crudForm = document.getElementById('crud-live-form');

  if (crudForm) {
    crudForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const title = document.getElementById('crud-title').value.trim();
      const tech = document.getElementById('crud-tech').value.trim();
      const description = document.getElementById('crud-desc').value.trim();

      if (!title || !tech || !description) {
        alert("Please fill all fields");
        return;
      }

      try {
        if (editingId) {
          // UPDATE
          await fetch(`${API_URL}/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, tech, description })
          });
          editingId = null;
        } else {
          // CREATE
          await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, tech, description })
          });
        }

        crudForm.reset();
        renderProjects();

      } catch (err) {
        console.error("Error saving project:", err);
        alert("Error saving project");
      }
    });
  }


  // 🔹 EDIT
  window.editProject = async function (id) {
    try {
      const res = await fetch(API_URL);
      const projects = await res.json();

      const project = projects.find(p => p.id === id);
      if (!project) return;

      document.getElementById('crud-title').value = project.title;
      document.getElementById('crud-tech').value = project.tech;
      document.getElementById('crud-desc').value = project.description;

      editingId = id;

    } catch (err) {
      console.error("Error editing project:", err);
    }
  };


  // 🔹 DELETE
  window.deleteProject = async function (id) {
    const confirmDelete = confirm("Delete this project?");
    if (!confirmDelete) return;

    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      renderProjects();

    } catch (err) {
      console.error("Error deleting project:", err);
      alert("Error deleting project");
    }
  };


  // ===========================
  // CONTACT FORM
  // ===========================
  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();

      if (!name || !email || !message) {
        alert("Please fill all fields");
        return;
      }

      try {
        const res = await fetch('/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, message })
        });

        if (res.ok) {
          alert("Message sent successfully!");
          contactForm.reset();
        } else {
          alert("Failed to send message");
        }

      } catch (err) {
        console.error("Contact error:", err);
        alert("Server error");
      }
    });
  }


  // ===========================
  // INIT LOAD
  // ===========================
  renderProjects();

});