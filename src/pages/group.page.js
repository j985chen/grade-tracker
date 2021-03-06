import React from 'react';
import axios from 'axios';
import { BrowserRouter, Switch, Route, Link } from 'react-router-dom';

import Home from './home.page';
import BackButton from '../components/backButton.component';
import LogoutButton from '../components/logoutButton.component';
import CourseBlock from '../components/courseBlock.component';
import NewAdder from '../components/newAdder.component';
import Course from './course.page';

import './pages.css';

class Group extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            courses: this.props.courses,
            average: 0,
        };
        this.addNewCourse = this.addNewCourse.bind(this);
        this.deleteCourse = this.deleteCourse.bind(this);
        this.renameCourse = this.renameCourse.bind(this);
    }

    componentDidMount() {
        axios.get(`http://localhost:5000/courses/getByGroup/${this.props.groupId}`)
        .then(res => {
            let courseData = res.data;
            let userId = localStorage.getItem('user');
            let groupAverage = 0, weightTotal = 0, groupCourses = [];
            for (let course in courseData) {
                if (courseData[course].userId !== userId) {
                    continue;
                }
                groupCourses.push(
                    { course: courseData[course].courseName, cid: courseData[course]._id, average: courseData[course].average }
                );
                groupAverage += courseData[course].average * courseData[course].weight;
                weightTotal += courseData[course].weight;
            }
            groupAverage = (weightTotal !== 0) ? groupAverage / weightTotal : 0;
            this.setState({
                average: groupAverage,
                courses: groupCourses
            });
        });  
    }

    addNewCourse() {
        let courseName = document.getElementById('courseName').value;
        let weight = document.getElementById('courseWeight').value
        let userId = localStorage.getItem('user');
        let groupId = this.props.groupId;
        let groupCourses = this.state.courses;
        let groupAverage = this.state.groupAverage * groupCourses.length;
        axios.post(`http://localhost:5000/courses/add`, { userId, groupId, courseName, grades: [], average: 0, weight })
            .then((res) => { 
                groupCourses.push(
                    { course: courseName, cid: res.data, average: 0 }
                );
                groupAverage = (groupAverage === 0) ? groupAverage / groupCourses.length : 0;
                this.setState({
                    courses: groupCourses,
                    average: groupAverage
                });
             })
            .catch(err => console.error('Error: ' + err));
    }

    async deleteCourse(courseId) {
        let groupCourses = this.state.courses;
        await axios.delete(`http://localhost:5000/courses/${courseId}`);
        let userId = localStorage.getItem('user');
        let groupName = this.props.groupName;
        let newCourses = [];
        for (let course in groupCourses) {
            if (groupCourses[course].cid !== courseId) {
                newCourses.push(groupCourses[course].course);
            }
        }
        await axios.post(`http://localhost:5000/groups/update/${this.props.groupId}`, { userId, groupName, courses: newCourses });
        this.setState({
            courses: groupCourses
        });
    }

    async renameCourse(courseId, newName) {
        let courseInfo = await axios.get(`http://localhost:5000/courses/${courseId}`);
        let groupInfo = await axios.get(`http://localhost:5000/groups/${this.props.groupId}`);
        let currentCourses = this.state.courses;
        let groupCourses = [];
        for (let course in currentCourses) {
            if (currentCourses[course].course === courseInfo.data.courseName) {
                currentCourses[course].course = newName;
                groupCourses.push(newName);
            } else {
                groupCourses.push(currentCourses[course].course);
            }
        }
        courseInfo.data.courseName = newName;
        groupInfo.data.courses = groupCourses;
        await axios.post(`http://localhost:5000/courses/update/${courseId}`, courseInfo.data);
        await axios.post(`http://localhost:5000/groups/update/${this.props.groupId}`, groupInfo.data);
        this.setState({
            courses: currentCourses
        });
    }

    render() {
        let courseBlocks = [], courses = [], i = 0;
        for (let course in this.state.courses) {
            let courseBlockComponent = <CourseBlock courseName={this.state.courses[course].course} courseId={this.state.courses[course].cid} average={this.state.courses[course].average} deleteComponent={this.deleteCourse} renameComponent={this.renameCourse} />;
            courseBlocks.push(
                <Link to={`/${this.props.groupName}/${this.state.courses[course].course}`} className='mt-3 pl-0 courseBlockLink' key={i}>
                    {courseBlockComponent}
                </Link>
            );
            courses.push(
                <Route exact path={`/${this.props.groupName}/${this.state.courses[course].course}`} key={i}>
                    <Course courseName={this.state.courses[course].course} groupId={this.props.groupId} courseId={this.state.courses[course].cid} />
                </Route>
            );
            i++;
        }

        const adderModalBody = (
            <>
                <label htmlFor='courseName'>Course name</label>
                <input type='text' className='form-control' id='courseName' />
                <label htmlFor='courseWeight'>Course credits</label>
                <select className='form-control' id='courseWeight'>
                    <option value='0.25'>0.25</option>
                    <option value='0.33'>0.33</option>
                    <option value='0.5' selected>0.5</option>
                    <option value='1'>1</option>
                </select>
            </>
        )

        return (
            <div>
                <BrowserRouter>
                    <Switch>
                        {courses}
                        <Route exact path='/'>
                            <Home />
                        </Route>
                        <Route path='/'>
                            <BackButton />
                            <LogoutButton />
                            <h1>{this.props.groupName}</h1>
                            <div>Overall average:&nbsp;{this.state.average}</div>
                            <div className='courses-wrapper'>{courseBlocks}</div>
                            <NewAdder 
                                adderType={"course"} 
                                adderModalBody={adderModalBody} 
                                handleAddNew={this.addNewCourse}
                            />
                        </Route>
                    </Switch>
                </BrowserRouter>
            </div>
        );
    }
}

export default Group;