import { renderFormField, renderPageShell } from '../utils/page-layout.js'

const mainHtml = `
  <section class="py-5 py-lg-6">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-9">
          <div class="page-header mb-4">
            <span class="badge rounded-pill joke-pill mb-3">Publish a joke</span>
            <h1 class="display-5 fw-bold mb-3">Create a Joke</h1>
            <p class="lead text-body-secondary mb-0">Draft your setup, choose a category, and prepare a joke for the arena. Login will be required later.</p>
          </div>

          <div class="card form-card border-0 shadow-lg">
            <div class="card-body p-4 p-xl-5">
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
                <div class="alert alert-warning mb-4" role="alert">You will need to be logged in before publishing jokes later.</div>
                <button class="btn btn-warning btn-lg" type="button">Publish Joke</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
`

document.querySelector('#app').innerHTML = renderPageShell('', mainHtml)