// Project Type
enum ProjectStatus { Active, Finished }

class Project {
    constructor(
        public id: string, 
        public title: string, 
        public description: string, 
        public people: number,
        public status: ProjectStatus
    ) {}
}

// Project State Management
type Listner<T> = (items: T[]) => void;

class State<T> {
    protected listeners: Listner<T>[] = [];

    addListener(ListenerFn: Listner<T>){
        this.listeners.push(ListenerFn);
    }
}


class ProjectState extends State<Project>{
    private projects: Project[] = [];

    // private property
    private static instance: ProjectState;

    // Using a private constructor to guarantee this is a singleton class
    private constructor(){
        super();
    }

    static getInstance(){
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }

    

    addProject(title: string, description: string, numberOfPeople: number) {
        const newProject = new Project(
            Math.random().toString(),
            title,
            description,
            numberOfPeople,
            ProjectStatus.Active
        )
        this.projects.push(newProject);

        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice())
        }
    }
}

// Global constant of the project class
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

// Component class base
abstract class Component <T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    hostElement: T;
    sectionElement: U;

    constructor(
        templateElementId: string, 
        hostElementId: string, 
        insertAtStart: boolean,
        newSectionElementId?: string)
        {
        this.templateElement = document.getElementById(templateElementId)! as HTMLTemplateElement;
        this.hostElement = document.getElementById(hostElementId)! as T;

        const templateElementContent = document.importNode(this.templateElement.content, true);
        this.sectionElement = templateElementContent.firstElementChild as U;
        if (newSectionElementId) {
            this.sectionElement.id = newSectionElementId;
        }
        this.attach(insertAtStart);
    }

    private attach(insertAtBegining: boolean) {
        this.hostElement.insertAdjacentElement(insertAtBegining ? 'afterbegin' : 'beforeend', this.sectionElement);
    }

    abstract configure():void;
    abstract renderContent():void;

}

// Project List
class ProjectList extends Component <HTMLDivElement, HTMLElement> {
    assignedProjects: Project[];

    constructor(private type: 'active' | 'finished') {
        super('project-list', 'app', false, `${type}-projects`);
        this.assignedProjects = [];

        this.configure();
        this.renderContent();  
    }

    configure() {
        projectState.addListener((projects: Project[]) => {
            const relevantProject = projects.filter(prj => {
                if (this.type === 'active'){
                    return prj.status === ProjectStatus.Active
                }
                else {
                    return prj.status === ProjectStatus.Finished
                }       
            });
            this.assignedProjects = relevantProject;
            this.renderProject();
        });
    }

    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.sectionElement.querySelector('ul')!.id = listId;
        this.sectionElement.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
    }

    private renderProject() {
        const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;     
        listEl.innerHTML = '';
        for (const projectItem of this.assignedProjects) {
            const listItem = document.createElement('li');
            listItem.textContent = projectItem.title;
            listEl.appendChild(listItem);
        }
    }
}


// Project class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        super('project-input', 'app', true, 'user-input');
        this.titleInputElement = this.hostElement.querySelector('#title') as HTMLInputElement;
        this.descriptionInputElement = this.hostElement.querySelector('#description') as HTMLInputElement;
        this.peopleInputElement = this.hostElement.querySelector('#people') as HTMLInputElement;
        
        this.configure();
        // this.attach();
    }
    
    configure() {
        this.hostElement.addEventListener('submit', this.submitHandler);
    }

    renderContent() {}


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
}

const project = new ProjectInput();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');
