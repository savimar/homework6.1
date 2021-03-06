import * as React from 'react'
import Nav from './Nav'

export default class Header extends React.Component {
  constructor (props) {
    super(props)
  }
  render () {
    return (
      <header  className = {this.props.css}>
        <div className="col-8 offset-2 col-sm-10 offset-sm-1 content">
          <Nav tabs={['Услуги', 'Цены', 'О компании', 'Контакты']} divClassName="col-12 col-md-9 menu"
               aClassName="itemMenu"/>;
        </div>
      </header>
    )
  }
}
