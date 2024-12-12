export type User = {
    id : number;
    email: string;
    name: string;
    address: string;
    school: string;
    major: string;
    course: Course;
}

type Course = {
    id: number;
    name: string;
    professor: string;
    location: string;
}
