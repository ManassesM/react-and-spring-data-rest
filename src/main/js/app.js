import CreateDialog from './components/CreateDialog'
import EmployeeList from './components/EmployeeList'

const React = require('react')
const ReactDOM = require('react-dom')
const client = require('./client')
const follow = require('./follow')
const when = require('when')

const root = '/api'

class App extends React.Component {
	constructor(props) {
		super(props)
		this.state = { employees: [], attributes: [], pageSize: 2, links: {} }
		this.updatePageSize = this.updatePageSize.bind(this)
		this.onCreate = this.onCreate.bind(this)
		this.onDelete = this.onDelete.bind(this)
		this.onNavigate = this.onNavigate.bind(this)
	}

	// third methods
	loadFromServer(pageSize) {
		follow(client, root, [{ rel: 'employees', params: { size: pageSize } }])
			.then(async (employeeCollection) => {
				const schema = await client({
					method: 'GET',
					path: employeeCollection.entity._links.profile.href,
					headers: { Accept: 'application/schema+json' },
				})
				this.schema = schema.entity
				this.links = employeeCollection.entity._links
				return employeeCollection
			})
			.then((employeeCollection) => {
				return employeeCollection.entity._embedded.employees.map((employee) =>
					client({
						method: 'GET',
						path: employee._links.self.href,
					})
				)
			})
			.then((employeePromises) => when.all(employeePromises))
			.done((employees) => {
				this.setState({
					employees,
					attributes: Object.keys(this.schema.properties),
					pageSize,
					links: this.links,
				})
			})
	}

	onCreate(newEmployee) {
		const self = this
		follow(client, root, ['employees'])
			.then((res) => {
				return client({
					method: 'POST',
					path: res.entity._links.self.href,
					entity: newEmployee,
					headers: { 'Content-Type': 'application/json' },
				})
			})
			.then((res) => {
				return follow(client, root, [
					{ rel: 'employees', params: { size: self.state.pageSize } },
				])
			})
			.done((res) => {
				if (typeof res.entity._links.last != 'undefined') {
					this.onNavigate(res.entity._links.last.href)
				} else {
					this.onNavigate(res.entity._links.self.href)
				}
			})
	}

	onDelete(employee) {
		client({ method: 'DELETE', path: employee.entity._links.self.href }).done(
			() => {
				this.loadFromServer(this.state.pageSize)
			}
		)
	}

	onUpdate(employee, updatedEmployee) {
		client({
			method: 'PUT',
			path: employee.entity._links.self.href,
			entity: updatedEmployee,
			headers: {
				'Content-Type': 'application/json',
				'If-Match': employee.headers.Etag,
			},
		}).done(
			() => {
				this.loadFromServer(this.state.pageSize)
			},
			(response) => {
				if (response.status.code === 412) {
					alert(
						'DENIED: Unable to update ' +
							employee.entity._links.self.href +
							'. Your copy is stale.'
					)
				}
			}
		)
	}

	onNavigate(navURI) {
		client({ method: 'GET', path: navURI })
			.then((employeeCollection) => {
				this.links = employeeCollection.entity._links

				return employeeCollection.entity._embedded.employees.map((employee) =>
					client({
						method: 'GET',
						path: employee._links.self.href,
					})
				)
			})
			.then((employeePromises) => {
				return when.all(employeePromises)
			})
			.done((employees) => {
				this.setState({
					employees: employees,
					attributes: Object.keys(this.schema.properties),
					pageSize: this.state.pageSize,
					links: this.links,
				})
			})
	}

	updatePageSize(pageSize) {
		if (pageSize !== this.state.pageSize) {
			this.loadFromServer(pageSize)
		}
	}

	// lifecycle
	componentDidMount() {
		this.loadFromServer(this.state.pageSize)
	}

	render() {
		return (
			<div>
				<p>Hello Spring</p>
				<CreateDialog
					attributes={this.state.attributes}
					onCreate={this.onCreate}
				/>
				<EmployeeList
					employees={this.state.employees}
					links={this.state.links}
					pageSize={this.state.pageSize}
					onNavigate={this.onNavigate}
					onUpdate={this.onUpdate}
					onDelete={this.onDelete}
					updatePageSize={this.updatePageSize}
					attributes={this.state.attributes}
				/>
			</div>
		)
	}
}

// render
ReactDOM.render(<App />, document.getElementById('react'))
