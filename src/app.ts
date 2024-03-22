// Project State Management
class ProjectState {
    private listeners: any[] = [];
    private projects: any[] = [];

    // private property
    private static instance: ProjectState;

    // Using a private constructor to guarantee this is a singleton class
    private constructor(){}

    static getInstance(){
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }

    addListener(ListenerFn: Function){
        this.listeners.push(ListenerFn);
    }

    addProject(title: string, description: string, numberOfPeople: number) {
        const newProject = {
            id: Math.random().toString,
            title: title,
            description: description,
            people: numberOfPeople
        }
        this.projects.push(newProject);

        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice())
        }
    }
}

// Global constant of the project class
// const projectState = new ProjectState();
const projectState = ProjectState.getInstance();


// Input validation
interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

const validate = (validatebleInput: Validatable) => {
    let isValid = true;
    if (validatebleInput.required) {
        isValid = isValid && validatebleInput.value.toString().trim().length !== 0;
    }

    if (validatebleInput.minLength != null && typeof validatebleInput.value === 'string') {
        isValid = isValid && validatebleInput.value.length >= validatebleInput.minLength;
    }

    if (validatebleInput.maxLength != null && typeof validatebleInput.value === 'string') {
        isValid = isValid && validatebleInput.value.length <= validatebleInput.maxLength;
    }

    if (validatebleInput.min != null && typeof validatebleInput.value === 'number') {
        isValid = isValid && validatebleInput.value >= validatebleInput.min;
    }

    if (validatebleInput.max != null && typeof validatebleInput.value === 'number') {
        isValid = isValid && validatebleInput.value <= validatebleInput.max;
    }
    return isValid;
}

// Using decorator for Autobind
const autobind = (_: any, _2: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    const adjustedDescriptor: PropertyDescriptor = {
        configurable: true,
        get(){
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    };
    return adjustedDescriptor;
}

// Project List
class ProjectList {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    sectionElement: HTMLElement;
    assignedProjects: any[];

    constructor(private type: 'active' | 'finished') {
        this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;

        const templateElementContent = document.importNode(this.templateElement.content, true);
        this.sectionElement = templateElementContent.firstElementChild as HTMLElement;
        this.sectionElement.id = `${this.type}-projects`;
        this.assignedProjects = [];

        projectState.addListener((projects: any[]) => {
            this.assignedProjects = projects;
            this.renderProject();
        });

        this.attach();
        this.renderContent();
    }

    private renderProject() {
        const listEl = document.getElementById(`${this.type}-projects`)! as HTMLUListElement;
        console.log(listEl);
        for (const projectItem of this.assignedProjects) {
            const listItem = document.createElement('li');
            listItem.textContent = projectItem.title;
            listEl.appendChild(listItem);
        }
    }

    private renderContent() {
        const listId = `${this.type}-projects`;
        this.sectionElement.querySelector('ul')!.id = listId;
        this.sectionElement.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
    }

    private attach() {
        this.hostElement.insertAdjacentElement('beforeend', this.sectionElement);
    }
}


// Project class
class ProjectInput {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    formElement: HTMLFormElement;
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;

        const templateElementContent = document.importNode(this.templateElement.content, true);
        this.formElement = templateElementContent.firstElementChild as HTMLFormElement;
        this.formElement.id = 'user-input';

        this.titleInputElement = this.formElement.querySelector('#title') as HTMLInputElement;
        this.descriptionInputElement = this.formElement.querySelector('#description') as HTMLInputElement;
        this.peopleInputElement = this.formElement.querySelector('#people') as HTMLInputElement;

        this.configure();
        this.attach();
    }

    private getUserInputs(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;

        const titleValidateable: Validatable = {
            value: enteredTitle,
            required: true
        }

        const descriptionValidateable: Validatable = {
            value: enteredDescription,
            required: true,
            minLength: 5
        }

        const peopleValidateable: Validatable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 5
        }
       
       if (!validate(titleValidateable) || !validate(descriptionValidateable) || !validate(peopleValidateable)) {
            alert('Invalid input! Please try again');
            return;
       } else {
           return [enteredTitle, enteredDescription, +enteredPeople]
       } 
    }

    private clearInput() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }

    @autobind
    private submitHandler(e: Event) {
        e.preventDefault();
        const userData = this.getUserInputs();
        if (Array.isArray(userData)){
            const [title, description, people] = [...userData];
            projectState.addProject(title, description, people);
            console.log(title, description, people);
            this.clearInput();
        }
    }

    private configure() {
        this.formElement.addEventListener('submit', this.submitHandler);
    }

    private attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.formElement);
    }
}

const project = new ProjectInput();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');
