"use strict";
class ProjectInput {
    constructor() {
        this.templateElement = document.getElementById('project-input');
        this.hostElement = document.getElementById('app');
        const templateElementContent = document.importNode(this.templateElement.content, true);
        this.formElement = templateElementContent.firstElementChild;
        this.formElement.id = 'user-input';
        this.titleInputElement = this.formElement.querySelector('#title');
        this.decriptionInputElement = this.formElement.querySelector('#description');
        this.peopleInputElement = this.formElement.querySelector('#people');
        this.configure();
        this.attach();
    }
    submitHandler(e) {
        e.preventDefault();
        console.log(this.titleInputElement.value);
    }
    configure() {
        this.formElement.addEventListener('submit', this.submitHandler.bind(this));
    }
    attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.formElement);
    }
}
const pr = new ProjectInput();
//# sourceMappingURL=app.js.map