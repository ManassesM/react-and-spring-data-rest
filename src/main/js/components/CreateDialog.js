const React = require('react')
const ReactDOM = require('react-dom')

class CreateDialog extends React.Component {
	constructor(props) {
		super(props)
		this.handleSubmit = this.handleSubmit.bind(this)
	}

	handleSubmit(e) {
		e.preventDefault()
		const newEmployee = {}

		this.props.attributes.forEach((att) => {
			newEmployee[att] = ReactDOM.findDOMNode(this.refs[att]).value.trim()
		})

		this.props.onCreate(newEmployee)

		this.props.attributes.forEach((att) => {
			ReactDOM.findDOMNode(this.refs[att]).value = ''
		})

		// hide dialog by navigating away
		window.location = '#'
	}

	render() {
		const inputs = this.props.attributes.map((att) => (
			<p key={att}>
				<input type='text' placeholder={att} ref={att} className='field' />
			</p>
		))

		return (
			<div>
				<a href='#createEmployee'>Create</a>

				<div id='createEmployee' className='modalDialog'>
					<div>
						<a href='#' title='Close' className='close'>
							X
						</a>

						<h2>Create new employee</h2>

						<form>
							{inputs}
							<button onClick={this.handleSubmit}>Create</button>
						</form>
					</div>
				</div>
			</div>
		)
	}
}

export default CreateDialog
