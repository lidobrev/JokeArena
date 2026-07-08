import { renderFormField, renderPageShell } from '../utils/page-layout.js'

const mainHtml = `
  <section class="py-5 py-lg-6">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-9">
          <div class="page-header mb-4">
            <span class="badge rounded-pill joke-pill mb-3">Edit joke draft</span>
            <h1 class="display-5 fw-bold mb-3">Edit Joke</h1>
            <p class="lead text-body-secondary mb-0">Adjust the setup, refine the punchline, and prepare the joke for publication later.</p>
          </div>

          <div class="card form-card border-0 shadow-lg">
            <div class="card-body p-4 p-xl-5">
              <div class="alert alert-info mb-4" role="alert">Only the author or an admin will be allowed to edit this joke later.</div>
              <form>
                ${renderFormField({ label: 'Title', name: 'title', placeholder: 'Why the programmer crossed the road' })}
                ${renderFormField({
                  label: 'Category',
                  type: 'select',
                  name: 'category',
                  options: [
                    { value: 'programming', label: 'Programming' },
                    { value: 'office', label: 'Office' },
                    { value: 'food', label: 'Food' },
                    { value: 'school', label: 'School' },
                    { value: 'other', label: 'Other' },
                  ],
                })}
                ${renderFormField({ label: 'Joke Text', type: 'textarea', name: 'joke-text', placeholder: 'Write the full joke here...' })}
                ${renderFormField({ label: 'Optional Image Upload', type: 'file', name: 'image-upload' })}
                <button class="btn btn-warning btn-lg" type="button">Save Changes</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
`

document.querySelector('#app').innerHTML = renderPageShell('', mainHtml)