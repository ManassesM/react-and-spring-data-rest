import Employee from './Employee'

const React = require('react')
const ReactDOM = require('react-dom')

class EmployeeList extends React.Component {
	constructor(props) {
		super(props)
		this.handleNavFirst = this.handleNavFirst.bind(this)
		this.handleNavPrev = this.handleNavPrev.bind(this)
		this.handleNavNext = this.handleNavNext.bind(this)
		this.handleNavLast = this.handleNavLast.bind(this)
		this.handleInput = this.handleInput.bind(this)
	}

	handleNavFirst(e) {
		e.preventDefault()
		this.props.onNavigate(this.props.links.first.href)
	}

	handleNavPrev(e) {
		e.preventDefault()
		this.props.onNavigate(this.props.links.prev.href)
	}

	handleNavNext(e) {
		e.preventDefault()
		this.props.onNavigate(this.props.links.next.href)
	}

	handleNavLast(e) {
		e.preventDefault()
		this.props.onNavigate(this.props.links.last.href)
	}

	handleInput(e) {
		e.preventDefault()
		const pageSize = ReactDOM.findDOMNode(this.refs.pageSize).value
		if (/^[0-9]+$/.test(pageSize)) {
			this.props.updatePageSize(pageSize)
		} else {
			ReactDOM.findDOMNode(this.refs.pageSize).value = pageSize.substring(
				0,
				pageSize.length - 1
			)
		}
	}

	render() {
		const employees = this.props.employees.map((employee) => (
			<Employee
				key={employee.entity._links.self.href}
				employee={employee}
				attributes={this.props.attributes}
				onUpdate={this.props.onUpdate}
				onDelete={this.props.onDelete}
			/>
		))

		const navLinks = []
		if ('first' in this.props.links)
			navLinks.push(
				<button key='first' onClick={this.handleNavFirst}>
					&lt;&lt;
				</button>
			)
		if ('prev' in this.props.links)
			navLinks.push(
				<button key='prev' onClick={this.handleNavPrev}>
					&lt;
				</button>
			)
		if ('next' in this.props.links)
			navLinks.push(
				<button key='next' onClick={this.handleNavNext}>
					&gt;
				</button>
			)
		if ('last' in this.props.links)
			navLinks.push(
				<button key='last' onClick={this.handleNavLast}>
					&gt;&gt;
				</button>
			)

		return (
			<div>
				<input
					ref='pageSize'
					defaultValue={this.props.pageSize}
					onInput={this.handleInput}
				/>
				<table>
					<tbody>
						<tr>
							<th>First Name</th>
							<th>Last Name</th>
							<th>Description</th>
							<th></th>
						</tr>
						{employees}
					</tbody>
				</table>
				<div>{navLinks}</div>
			</div>
		)
	}
}

export default EmployeeList
