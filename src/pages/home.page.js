import React from 'react';
import axios from 'axios';
import { BrowserRouter, Switch, Route, Link } from 'react-router-dom';
import GroupBlock from '../components/groupBlock.component';
import Group from './group.page';

import './pages.css';

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            groups: {}
        };
    }

    componentDidMount() {
        axios.get(`http://localhost:5000/courses`)
            .then(res => {
                let courseData = res.data;
                let username = localStorage.getItem('user');
                let courseGroups = {};
                for (let i = 0; i < courseData.length; i++) {
                    if (courseData[i].username != username) {
                        continue;
                    }
                    if (!courseGroups[courseData[i].groupname]) {
                        courseGroups[courseData[i].groupname] = [
                            { "course": courseData[i].coursename, "cid": courseData[i]._id, "average": courseData[i].average, "weight": courseData[i].weight }
                        ];
                    } else {
                        courseGroups[courseData[i].groupname].push(
                            { "course": courseData[i].coursename, "cid": courseData[i]._id, "average": courseData[i].average, "weight": courseData[i].weight }
                        );
                    }
                }
                this.setState({
                    groups: courseGroups
                });
            })
            .catch(err => console.error('Error: ' + err));
    }

    render() {
        let groupBlocks = [], groups = [], i = 0;
        for (let group in this.state.groups) {
            let groupBlockComponent = <GroupBlock name={group} courses={JSON.stringify(this.state.groups[group])} />;
            groupBlocks.push(
                <Link to={`/${group}`} className='mt-3 mr-2 pl-0' key={i}>
                    {groupBlockComponent}
                </Link> 
            );
            groups.push(
                <Route exact path={`/${group}`} key={i}>
                    <Group name={group} courses={JSON.stringify(this.state.groups[group])} />
                </Route>
            );
            i++;
        }

        return (
            <div>
                <BrowserRouter>
                    <Switch>
                        {groups}
                        <Route path='/'>
                            <h1>Course groups</h1>
                            <div className="groups-wrapper">{groupBlocks}</div>
                        </Route>
                    </Switch>
                </BrowserRouter>
            </div>
        );
    }
}

export default Home;