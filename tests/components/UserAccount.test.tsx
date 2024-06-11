import { render, screen } from '@testing-library/react'
import { User } from '../../src/entities'
import UserAccount from '../../src/components/UserAccount';

describe('UserAccount', () => {
    it('应该渲染name', () => {
        const user:User = {id:1,name:"mosh"};
        render(<UserAccount user={user}/>)
        expect(screen.getByText(user.name)).toBeInTheDocument();
    })
    it('如果用户是admin,则渲染edit按钮', () => {
        const user:User = {id:1,name:"mosh",isAdmin:true};
        render(<UserAccount user={user}/>)
        const button = screen.getByRole("button")
        expect(button).toBeInTheDocument()
        expect(button).toHaveTextContent(/edit/i)
    })
    it('如果用户不是admin,则不渲染edit按钮', () => {
        const user:User = {id:1,name:"mosh"};
        render(<UserAccount user={user}/>)
        const button = screen.queryByRole("button")
        expect(button).not.toBeInTheDocument()
    })
})