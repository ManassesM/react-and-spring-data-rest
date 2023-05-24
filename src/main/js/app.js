import CreateDialog from './components/CreateDialog'
import EmployeeList from './components/EmployeeList'

const React = require('react')
const ReactDOM = require('react-dom')
const client = require('./client')
const follow = require('./follow')

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
			.then((empCollection) => {
				return client({
					method: 'GET',
					path: empCollection.entity._links.profile.href,
					headers: { Accept: 'application/schema+json' },
				}).then((schema) => {
					this.schema = schema.entity
					return empCollection
				})
			})
			.done((empCollection) => {
				this.setState({
					employees: empCollection.entity._embedded.employees,
					attributes: Object.keys(this.schema.properties),
					pageSize: pageSize,
					links: empCollection.entity._links,
				})
			})
	}

	onCreate(newEmp) {
		follow(client, root, ['employees'])
			.then((empCollection) => {
				return client({
					method: 'POST',
					path: empCollection.entity._links.self.href,
					entity: newEmp,
					headers: { 'Content-Type': 'application/json' },
				})
			})
			.then((res) => {
				return follow(client, root, [
					{ rel: 'employees', params: { size: this.state.pageSize } },
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
		client({ method: 'DELETE', path: employee._links.self.href }).done(
			(res) => {
				this.loadFromServer(this.state.pageSize)
			}
		)
	}

	onNavigate(navURI) {
		client({ method: 'GET', path: navURI }).done((empCollection) => {
			this.setState({
				employees: empCollection.entity._embedded.employees,
				attributes: this.state.attributes,
				pageSize: this.state.pageSize,
				links: empCollection.entity._links,
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
			<>
				<p>Hello Spring</p>
				<CreateDialog
					attributes={this.state.attributes}
					onCreate={this.onCreate}
				/>
				<EmployeeList
					employees={this.state.employees}
					links={this.state.links}
					pageSize={this.state.pageSize}
					onNavigate={this.state.onNavigate}
					onDelete={this.onDelete}
					updatePageSize={this.updatePageSize}
				/>
			</>
		)
	}
}

// render
ReactDOM.render(<App />, document.getElementById('react'))
